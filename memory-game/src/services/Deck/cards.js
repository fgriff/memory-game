const importedCards = import.meta.glob('../../assets/cards/*.png', {
  eager: true,
  import: 'default',
});

export const CARD_IMAGES = Object.entries(importedCards).map(([path, src]) => {
  const imageName = path.split('/').pop() ?? '';
  const name = imageName.replace(/\.png$/i, '');

  return { name, src };
});
