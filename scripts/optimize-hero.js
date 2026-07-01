const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'assets', 'portrait.jpg');
const outWebp = path.join(__dirname, '..', 'assets', 'portrait.webp');
const outAvif = path.join(__dirname, '..', 'assets', 'portrait.avif');
sharp(src)
  .toFormat('webp')
  .toFile(outWebp)
  .then(() => console.log('WebP created'))
  .catch(err => console.error(err));
sharp(src)
  .toFormat('avif')
  .toFile(outAvif)
  .then(() => console.log('AVIF created'))
  .catch(err => console.error(err));
