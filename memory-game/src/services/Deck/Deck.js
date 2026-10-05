import { CARD_IMAGES } from './cards';
import { PAIRS_COUNT } from '../../utils/constants';

function shuffle(array) {
  const result = array.slice();

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function createDeck() {
  const displayedCards = shuffle(CARD_IMAGES).slice(0, PAIRS_COUNT);

  const pairs = displayedCards.map((image, index) => ({
    pairId: index,
    name: image.name,
    imageSrc: image.src,
  }));

  const doubled = pairs.flatMap((pair) => [pair, pair]);

  const cards = shuffle(doubled).map((card, index) => ({
    id: index,
    pairId: card.pairId,
    name: card.name,
    imageSrc: card.imageSrc,
  }));

  console.log(cards.map((card) => card.pairId));

  return cards;
}
