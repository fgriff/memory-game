//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/core/Element/Element.js
var Element = class Element {
	#element;
	#listeners = [];
	constructor({ tagName = "div", classNames = [], textContent = "", attributes = {} } = {}) {
		this.#element = document.createElement(tagName);
		if (attributes) {
			const { class: _, ...rest } = attributes;
			Object.entries(rest).forEach(([name, value]) => {
				if (typeof value === "boolean") this.#element.toggleAttribute(name, value);
				else this.#element.setAttribute(name, value);
			});
		}
		const classList = (Array.isArray(classNames) ? classNames : String(classNames).split(" ")).filter(Boolean);
		if (classList.length) this.#element.classList.add(...classList);
		this.#element.textContent = textContent ?? "";
	}
	get element() {
		return this.#element;
	}
	render(parentNode) {
		(parentNode instanceof Element ? parentNode.element : parentNode).append(this.#element);
		return this;
	}
	on(eventName, handler, options) {
		this.#element.addEventListener(eventName, handler, options);
		this.#listeners.push({
			eventName,
			handler,
			options
		});
		return this;
	}
	onClick(handler) {
		return this.on("click", handler);
	}
	addClass(className) {
		this.#element.classList.add(className);
		return this;
	}
	removeClass(className) {
		this.#element.classList.remove(className);
		return this;
	}
	toggleClass(className, force) {
		this.#element.classList.toggle(className, force);
		return this;
	}
	setText(text) {
		this.#element.textContent = text ?? "";
		return this;
	}
	destroy() {
		this.#listeners.forEach(({ eventName, handler, options }) => {
			this.#element.removeEventListener(eventName, handler, options);
		});
		this.#listeners = [];
		this.#element.remove();
	}
};
//#endregion
//#region src/components/Button/Button.js
var Button = class extends Element {
	constructor({ text, classNames }) {
		super({
			tagName: "button",
			classNames: `btn ${classNames}`,
			textContent: text
		});
	}
};
//#endregion
//#region src/components/Header/Header.js
var Header = class extends Element {
	constructor({ onNewGame, onOpenLeaderboard } = {}) {
		super({
			tagName: "header",
			classNames: "header"
		});
		this.newGameButton = new Button({
			text: "Новая игра",
			classNames: "header__btn"
		}).render(this.element);
		this.newGameButton.onClick(() => onNewGame?.());
		this.leaderboardButton = new Button({
			text: "Таблица лидеров",
			classNames: "header__btn"
		}).render(this.element);
		this.leaderboardButton.onClick(() => onOpenLeaderboard?.());
	}
};
//#endregion
//#region src/utils/constants.js
var EVENT_STATE_UPDATE = "state:update";
var EVENT_CARD_FLIP = "card:flip";
var EVENT_CARD_UNFLIP = "card:unflip";
var EVENT_CARD_MATCH = "card:match";
var EVENT_CARD_DISABLE = "card:disable";
var EVENT_CARD_ENABLE = "card:enable";
var EVENT_GAME_WIN = "game:win";
var EVENT_GAME_NEW = "game:new";
var MATCH_DELAY_MS = 1e3;
var STORAGE_KEY = "fgriff-memory-game";
//#endregion
//#region src/components/Counter/Counter.js
var Counter = class extends Element {
	#movesCount;
	#pairsCount;
	constructor() {
		super({
			tagName: "section",
			classNames: "counter"
		});
		this.#movesCount = new Element({ classNames: "counter__item" }).render(this.element);
		this.#pairsCount = new Element({ classNames: "counter__item" }).render(this.element);
		this.setMoves(0);
		this.setPairs(0);
	}
	setMoves(value) {
		this.#movesCount.setText(`Ходы: ${value}`);
		return this;
	}
	setPairs(value) {
		this.#pairsCount.setText(`Пары: ${value} из 8`);
		return this;
	}
};
//#endregion
//#region src/components/Card/Card.js
var Card = class extends Element {
	#cardId;
	#pairId;
	#isFlipped = false;
	#isMatched = false;
	#isDisabled = false;
	#onSelect;
	constructor({ id, pairId, name, imageSrc, onSelect }) {
		super({ classNames: "card" });
		this.#cardId = id;
		this.#pairId = pairId;
		this.#onSelect = onSelect;
		this.cardInner = new Element({ classNames: "card__inner" }).render(this.element);
		this.cardFront = new Element({ classNames: "card__face card__face_front" }).render(this.cardInner.element);
		this.cardBack = new Element({ classNames: "card__face card__face_back" }).render(this.cardInner.element);
		this.cardBack.element.append(this.#createImage({
			src: imageSrc,
			alt: name
		}));
		this.onClick(() => this.#clickHandler());
	}
	#createImage({ src, alt = "" }) {
		const img = document.createElement("img");
		img.className = "card__image";
		img.src = src ?? "";
		img.alt = alt;
		img.draggable = false;
		return img;
	}
	#clickHandler() {
		if (!this.isClickable) return;
		this.#onSelect?.(this);
	}
	get id() {
		return this.#cardId;
	}
	get pairId() {
		return this.#pairId;
	}
	get isClickable() {
		return !this.#isDisabled && !this.#isFlipped && !this.#isMatched;
	}
	flip() {
		if (this.#isFlipped || this.#isMatched) return this;
		this.#isFlipped = true;
		this.addClass("flipped");
		return this;
	}
	unflip() {
		if (!this.#isFlipped) return this;
		this.#isFlipped = false;
		this.removeClass("flipped");
		return this;
	}
	match() {
		this.#isMatched = true;
		this.addClass("matched");
		return this;
	}
	setDisabled(value) {
		this.#isDisabled = Boolean(value);
		this.toggleClass("disabled", this.#isDisabled);
		return this;
	}
	reset() {
		this.removeClass("flipped");
		this.removeClass("matched");
		this.removeClass("disabled");
		this.#isFlipped = false;
		this.#isMatched = false;
		this.#isDisabled = false;
		return this;
	}
};
//#endregion
//#region src/components/Board/Board.js
var Board = class extends Element {
	#cards = [];
	#onCardSelect;
	constructor({ deck, onSelect }) {
		super({ classNames: "game-field" });
		this.#onCardSelect = onSelect;
		this.#cards = deck.map((cardData) => new Card({
			id: cardData.id,
			pairId: cardData.pairId,
			name: cardData.name,
			imageSrc: cardData.imageSrc,
			onSelect: (card) => this.#onCardSelect?.(card)
		}).render(this.element));
	}
	get cards() {
		return this.#cards;
	}
};
//#endregion
//#region src/assets/img/cards/ant.png
var ant_default = new URL("ant-BcbG_YeV.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/anteater.png
var anteater_default = new URL("anteater-DgGS7V_A.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/bear.png
var bear_default = new URL("bear-BJdwL-7x.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/bee.png
var bee_default = new URL("bee-CrXQ8P2t.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/beetle.png
var beetle_default = new URL("beetle-CVrV0NLC.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/bison.png
var bison_default = new URL("bison-QidkLX8x.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/chameleon.png
var chameleon_default = new URL("chameleon-cHGUvnz6.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/cheetah.png
var cheetah_default = new URL("cheetah-D8okS3-R.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/chicken.png
var chicken_default = new URL("chicken-G6_xjGeh.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/cougar.png
var cougar_default = new URL("cougar-Bs6aoJtt.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/cow.png
var cow_default = new URL("cow-CUp29dyD.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/crocodile.png
var crocodile_default = new URL("crocodile-GpYSa1Dz.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/dolphin.png
var dolphin_default = new URL("dolphin-ChFm1PU-.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/frog.png
var frog_default = new URL("frog-BCs9uu2J.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/giraffe.png
var giraffe_default = new URL("giraffe-D65w_sVA.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/gorilla.png
var gorilla_default = new URL("gorilla-BtYcjJHB.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/kiwi.png
var kiwi_default = new URL("kiwi-BhdHDtVY.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/koala.png
var koala_default = new URL("koala-BcnuIHla.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/ladybug.png
var ladybug_default = new URL("ladybug-ZWSOEgxv.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/lemur.png
var lemur_default = new URL("lemur-CKTud5BU.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/llama.png
var llama_default = new URL("llama-C9VVKwft.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/lobster.png
var lobster_default = new URL("lobster-4EPTU-8K.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/monkey.png
var monkey_default = new URL("monkey-D5tWl9fy.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/mouse.png
var mouse_default = new URL("mouse-BWt1_pTP.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/octopus.png
var octopus_default = new URL("octopus-DclPJ38e.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/orangutan.png
var orangutan_default = new URL("orangutan-B4Lp7Rc_.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/ostrich.png
var ostrich_default = new URL("ostrich-U3y2_uSa.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/otter.png
var otter_default = new URL("otter-B52tHRvO.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/owl.png
var owl_default = new URL("owl-B228PLPq.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/peacock.png
var peacock_default = new URL("peacock-B87wdXsD.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/penguin.png
var penguin_default = new URL("penguin-lmeFzUdA.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/pig.png
var pig_default = new URL("pig-9PjC4XgB.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/pigeon.png
var pigeon_default = new URL("pigeon-CwKiR5Vb.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/platypus.png
var platypus_default = new URL("platypus-Dhkq38lw.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/porcupine.png
var porcupine_default = new URL("porcupine-PZS9S0LB.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/prawn.png
var prawn_default = new URL("prawn-COSsBksN.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/raccoon.png
var raccoon_default = new URL("raccoon-DATy3E0t.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/shark.png
var shark_default = new URL("shark-2e8x3MaW.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/snake.png
var snake_default = new URL("snake-HAZi48dQ.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/swan.png
var swan_default = new URL("swan-CYmzHQtr.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/tiger.png
var tiger_default = new URL("tiger-DvY9ekxx.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/tortoise.png
var tortoise_default = new URL("tortoise-UQVkuof_.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/toucan.png
var toucan_default = new URL("toucan-B_qEMbKm.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/turkey.png
var turkey_default = new URL("turkey-CzDtw3oK.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/turtle.png
var turtle_default = new URL("turtle-CGXLlh7m.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/walrus.png
var walrus_default = new URL("walrus-CtFpkgDr.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/whale.png
var whale_default = new URL("whale-7CnQDifl.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/wolf.png
var wolf_default = new URL("wolf-B11zEnVr.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/yak.png
var yak_default = new URL("yak-DP4ArVrB.png", import.meta.url).href;
//#endregion
//#region src/assets/img/cards/zebra.png
var zebra_default = new URL("zebra-BaIqWBnB.png", import.meta.url).href;
var CARD_IMAGES = Object.entries(/* @__PURE__ */ Object.assign({
	"../../assets/img/cards/ant.png": ant_default,
	"../../assets/img/cards/anteater.png": anteater_default,
	"../../assets/img/cards/bear.png": bear_default,
	"../../assets/img/cards/bee.png": bee_default,
	"../../assets/img/cards/beetle.png": beetle_default,
	"../../assets/img/cards/bison.png": bison_default,
	"../../assets/img/cards/chameleon.png": chameleon_default,
	"../../assets/img/cards/cheetah.png": cheetah_default,
	"../../assets/img/cards/chicken.png": chicken_default,
	"../../assets/img/cards/cougar.png": cougar_default,
	"../../assets/img/cards/cow.png": cow_default,
	"../../assets/img/cards/crocodile.png": crocodile_default,
	"../../assets/img/cards/dolphin.png": dolphin_default,
	"../../assets/img/cards/frog.png": frog_default,
	"../../assets/img/cards/giraffe.png": giraffe_default,
	"../../assets/img/cards/gorilla.png": gorilla_default,
	"../../assets/img/cards/kiwi.png": kiwi_default,
	"../../assets/img/cards/koala.png": koala_default,
	"../../assets/img/cards/ladybug.png": ladybug_default,
	"../../assets/img/cards/lemur.png": lemur_default,
	"../../assets/img/cards/llama.png": llama_default,
	"../../assets/img/cards/lobster.png": lobster_default,
	"../../assets/img/cards/monkey.png": monkey_default,
	"../../assets/img/cards/mouse.png": mouse_default,
	"../../assets/img/cards/octopus.png": octopus_default,
	"../../assets/img/cards/orangutan.png": orangutan_default,
	"../../assets/img/cards/ostrich.png": ostrich_default,
	"../../assets/img/cards/otter.png": otter_default,
	"../../assets/img/cards/owl.png": owl_default,
	"../../assets/img/cards/peacock.png": peacock_default,
	"../../assets/img/cards/penguin.png": penguin_default,
	"../../assets/img/cards/pig.png": pig_default,
	"../../assets/img/cards/pigeon.png": pigeon_default,
	"../../assets/img/cards/platypus.png": platypus_default,
	"../../assets/img/cards/porcupine.png": porcupine_default,
	"../../assets/img/cards/prawn.png": prawn_default,
	"../../assets/img/cards/raccoon.png": raccoon_default,
	"../../assets/img/cards/shark.png": shark_default,
	"../../assets/img/cards/snake.png": snake_default,
	"../../assets/img/cards/swan.png": swan_default,
	"../../assets/img/cards/tiger.png": tiger_default,
	"../../assets/img/cards/tortoise.png": tortoise_default,
	"../../assets/img/cards/toucan.png": toucan_default,
	"../../assets/img/cards/turkey.png": turkey_default,
	"../../assets/img/cards/turtle.png": turtle_default,
	"../../assets/img/cards/walrus.png": walrus_default,
	"../../assets/img/cards/whale.png": whale_default,
	"../../assets/img/cards/wolf.png": wolf_default,
	"../../assets/img/cards/yak.png": yak_default,
	"../../assets/img/cards/zebra.png": zebra_default
})).map(([path, src]) => {
	return {
		name: (path.split("/").pop() ?? "").replace(/\.png$/i, ""),
		src
	};
});
//#endregion
//#region src/services/Deck/Deck.js
function shuffle(array) {
	const result = array.slice();
	for (let i = result.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
function createDeck() {
	const cards = shuffle(shuffle(CARD_IMAGES).slice(0, 8).map((image, index) => ({
		pairId: index,
		name: image.name,
		imageSrc: image.src
	})).flatMap((pair) => [pair, pair])).map((card, index) => ({
		id: index,
		pairId: card.pairId,
		name: card.name,
		imageSrc: card.imageSrc
	}));
	console.log(cards.map((card) => card.pairId));
	return cards;
}
//#endregion
//#region src/core/EventBus/EventBus.js
var EventBus = class {
	#listeners = /* @__PURE__ */ new Map();
	subscribe(eventName, handler) {
		if (!this.#listeners.has(eventName)) this.#listeners.set(eventName, /* @__PURE__ */ new Set());
		this.#listeners.get(eventName).add(handler);
		return () => this.unsubscribe(eventName, handler);
	}
	unsubscribe(eventName, handler) {
		this.#listeners.get(eventName)?.delete(handler);
	}
	emit(eventName, payload) {
		this.#listeners.get(eventName)?.forEach((handler) => handler(payload));
	}
};
//#endregion
//#region src/game/Game.js
var Game = class {
	#bus;
	#deck = [];
	#moves = 0;
	#pairsFound = 0;
	#firstCard = null;
	#isLocked = false;
	#unmatchTimer = null;
	#isFinished = false;
	constructor(bus = new EventBus()) {
		this.#bus = bus;
		this.#startNewGame();
	}
	#startNewGame() {
		if (this.#unmatchTimer !== null) {
			clearTimeout(this.#unmatchTimer);
			this.#unmatchTimer = null;
		}
		this.#deck = createDeck();
		this.#moves = 0;
		this.#pairsFound = 0;
		this.#firstCard = null;
		this.#isLocked = false;
		this.#isFinished = false;
		this.#bus.emit(EVENT_GAME_NEW, { deck: this.#deck });
		this.#emitState();
	}
	#emitState() {
		this.#bus.emit(EVENT_STATE_UPDATE, {
			moves: this.#moves,
			pairsFound: this.#pairsFound,
			totalPairs: 8
		});
	}
	get deck() {
		return this.#deck;
	}
	get bus() {
		return this.#bus;
	}
	startNewGame() {
		this.#startNewGame();
	}
	cardClickHandler(card) {
		if (this.#isFinished) return;
		if (this.#isLocked) return;
		if (!this.#firstCard) {
			this.#firstCard = card;
			this.#bus.emit(EVENT_CARD_FLIP, { id: card.id });
			return;
		}
		if (this.#firstCard.id === card.id) return;
		this.#bus.emit(EVENT_CARD_FLIP, { id: card.id });
		this.#moves += 1;
		this.#emitState();
		const first = this.#firstCard;
		this.#firstCard = null;
		if (first.pairId === card.pairId) {
			this.#pairsFound += 1;
			this.#bus.emit(EVENT_CARD_MATCH, { id: first.id });
			this.#bus.emit(EVENT_CARD_MATCH, { id: card.id });
			this.#emitState();
			if (this.#pairsFound === 8) {
				this.#isFinished = true;
				this.#bus.emit(EVENT_GAME_WIN, { moves: this.#moves });
			}
			return;
		}
		this.#isLocked = true;
		this.#bus.emit(EVENT_CARD_DISABLE, {});
		this.#unmatchTimer = setTimeout(() => {
			this.#unmatchTimer = null;
			this.#bus.emit(EVENT_CARD_UNFLIP, { id: first.id });
			this.#bus.emit(EVENT_CARD_UNFLIP, { id: card.id });
			this.#isLocked = false;
			this.#bus.emit(EVENT_CARD_ENABLE, {});
		}, MATCH_DELAY_MS);
	}
};
//#endregion
//#region src/components/Modal/Modal.js
var Modal = class extends Element {
	#window;
	#contentSlot;
	#onClose;
	#isOpen = false;
	constructor({ onClose } = {}) {
		super({
			tagName: "dialog",
			classNames: "modal"
		});
		this.#onClose = onClose;
		this.#window = new Element({ classNames: "modal__window" }).render(this.element);
		this.#contentSlot = new Element({ classNames: "modal__content" }).render(this.#window.element);
		this.onClick((event) => {
			if (!this.#window.element.contains(event.target)) this.close();
		});
		this.element.addEventListener("close", () => {
			if (this.#isOpen) {
				this.#isOpen = false;
				document.body.classList.remove("modal-open");
				this.#onClose?.();
			}
		});
	}
	get isOpen() {
		return this.#isOpen;
	}
	open(content) {
		if (this.#isOpen) return this;
		if (content) this.setContent(content);
		this.#isOpen = true;
		document.body.classList.add("modal-open");
		this.element.showModal();
		return this;
	}
	close() {
		if (!this.#isOpen) return this;
		this.element.close();
		return this;
	}
	setContent(content) {
		while (this.#contentSlot.element.firstChild) this.#contentSlot.element.firstChild.remove();
		if (content) content.render(this.#contentSlot);
		return this;
	}
};
//#endregion
//#region src/components/VictoryModal/VictoryModal.js
var VictoryModal = class extends Element {
	#title;
	#movesText;
	#onNewGame;
	#onClose;
	constructor({ onNewGame, onClose } = {}) {
		super({ classNames: "victory" });
		this.#onNewGame = onNewGame;
		this.#onClose = onClose;
		this.#title = new Element({
			tagName: "h2",
			classNames: "victory__title",
			textContent: "Победа!"
		}).render(this.element);
		this.#movesText = new Element({ classNames: "victory__moves" }).render(this.element);
		const actions = new Element({ classNames: "victory__actions" }).render(this.element);
		new Button({
			text: "Новая игра",
			classNames: "victory__btn"
		}).render(actions).onClick(() => this.#onNewGame?.());
		new Button({
			text: "Закрыть",
			classNames: "victory__btn"
		}).render(actions).onClick(() => this.#onClose?.());
		this.setMoves(0);
	}
	setMoves(moves) {
		this.#movesText.setText(`Ходов: ${moves}`);
		return this;
	}
};
//#endregion
//#region src/utils/formatDate.js
function formatDate(timestamp) {
	const date = new Date(timestamp);
	return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}
//#endregion
//#region src/services/Storage/Storage.js
var Storage = class {
	static getData() {
		try {
			const rawData = localStorage.getItem(STORAGE_KEY);
			if (!rawData) return [];
			const data = JSON.parse(rawData);
			if (!Array.isArray(data)) return [];
			return data;
		} catch {
			return [];
		}
	}
	static saveData(results) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
		} catch {}
	}
	static clear() {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {}
	}
};
//#endregion
//#region src/services/Leaderboard/Leaderboard.js
var Leaderboard = class Leaderboard {
	static sort(results) {
		return results.slice().sort((a, b) => {
			if (a.moves !== b.moves) return a.moves - b.moves;
			return a.date - b.date;
		});
	}
	static getAll() {
		return Leaderboard.sort(Storage.getData());
	}
	static getTop(limit = 10) {
		return Leaderboard.getAll().slice(0, limit);
	}
	static isEmpty() {
		return Storage.getData().length === 0;
	}
	static addResult(moves, date = Date.now()) {
		const entry = {
			moves,
			date
		};
		const all = [...Storage.getData(), entry];
		const top = Leaderboard.sort(all).slice(0, 10);
		Storage.saveData(top);
	}
	static clear() {
		Storage.clear();
	}
};
//#endregion
//#region src/components/LeaderboardModal/LeaderboardModal.js
var LeaderboardModal = class extends Element {
	#body;
	#onClose;
	constructor({ onClose } = {}) {
		super({ classNames: "leaderboard" });
		this.#onClose = onClose;
		new Element({
			tagName: "h2",
			classNames: "leaderboard__title",
			textContent: "Таблица лидеров"
		}).render(this.element);
		this.#body = new Element({ classNames: "leaderboard__body" }).render(this.element);
		const actions = new Element({ classNames: "leaderboard__actions" }).render(this.element);
		new Button({
			text: "Закрыть",
			classNames: "leaderboard__btn"
		}).render(actions).onClick(() => this.#onClose?.());
		this.refresh();
	}
	#clearBody() {
		while (this.#body.element.firstChild) this.#body.element.firstChild.remove();
	}
	#createTable(results) {
		const table = document.createElement("table");
		table.className = "leaderboard__table";
		const thead = document.createElement("thead");
		const headRow = document.createElement("tr");
		[
			"Место",
			"Ходы",
			"Дата"
		].forEach((label) => {
			const th = document.createElement("th");
			th.textContent = label;
			headRow.append(th);
		});
		thead.append(headRow);
		const tbody = document.createElement("tbody");
		results.forEach((item, index) => {
			const tr = document.createElement("tr");
			const place = document.createElement("td");
			place.textContent = String(index + 1);
			const moves = document.createElement("td");
			moves.textContent = String(item.moves);
			const date = document.createElement("td");
			date.textContent = formatDate(item.date);
			tr.append(place, moves, date);
			tbody.append(tr);
		});
		table.append(thead, tbody);
		return table;
	}
	refresh() {
		this.#clearBody();
		const results = Leaderboard.getTop();
		if (results.length === 0) {
			new Element({
				classNames: "leaderboard__empty",
				textContent: "Пока нет результатов"
			}).render(this.#body);
			return;
		}
		const table = this.#createTable(results);
		this.#body.element.append(table);
		return this;
	}
};
//#endregion
//#region src/components/App/App.js
var App = class extends Element {
	#game;
	#header;
	#counter;
	#board;
	#boardContainer;
	#modal;
	#victoryContent;
	#leaderboardContent;
	constructor() {
		super({ classNames: "app" });
		this.#game = new Game();
		this.#header = new Header({
			onNewGame: () => this.#game.startNewGame(),
			onOpenLeaderboard: () => this.#openLeaderboard()
		}).render(this.element);
		this.#counter = new Counter().render(this.element);
		this.#boardContainer = new Element({
			tagName: "section",
			classNames: "app__board-container"
		}).render(this.element);
		this.#board = this.#createBoard(this.#game.deck);
		this.#modal = new Modal().render(this.element);
		this.#victoryContent = new VictoryModal({
			onNewGame: () => {
				this.#modal.close();
				this.#game.startNewGame();
			},
			onClose: () => this.#modal.close()
		});
		this.#leaderboardContent = new LeaderboardModal({ onClose: () => this.#modal.close() });
		this.#bindGameEvents();
	}
	#createBoard(deck) {
		return new Board({
			deck,
			onSelect: (card) => this.#game.cardClickHandler(card)
		}).render(this.#boardContainer);
	}
	#bindGameEvents() {
		const bus = this.#game.bus;
		bus.subscribe(EVENT_STATE_UPDATE, ({ moves, pairsFound }) => {
			this.#counter.setMoves(moves);
			this.#counter.setPairs(pairsFound);
		});
		bus.subscribe(EVENT_CARD_FLIP, ({ id }) => this.#findCard(id)?.flip());
		bus.subscribe(EVENT_CARD_UNFLIP, ({ id }) => this.#findCard(id)?.unflip());
		bus.subscribe(EVENT_CARD_MATCH, ({ id }) => this.#findCard(id)?.match());
		bus.subscribe(EVENT_CARD_DISABLE, () => {
			this.#board.cards.forEach((card) => card.setDisabled(true));
		});
		bus.subscribe(EVENT_CARD_ENABLE, () => {
			this.#board.cards.forEach((card) => card.setDisabled(false));
		});
		bus.subscribe(EVENT_GAME_WIN, ({ moves }) => this.#winHandler(moves));
		bus.subscribe(EVENT_GAME_NEW, ({ deck }) => {
			this.#board.destroy();
			this.#board = this.#createBoard(deck);
		});
	}
	#findCard(id) {
		return this.#board.cards.find((card) => card.id === id);
	}
	#winHandler(moves) {
		Leaderboard.addResult(moves);
		this.#victoryContent.setMoves(moves);
		this.#modal.open(this.#victoryContent);
	}
	#openLeaderboard() {
		this.#leaderboardContent.refresh();
		this.#modal.open(this.#leaderboardContent);
	}
};
//#endregion
//#region src/main.js
window.onload = () => {
	const app = new App();
	document.body.prepend(app.element);
};
//#endregion

//# sourceMappingURL=index-D3MtwpdH.js.map