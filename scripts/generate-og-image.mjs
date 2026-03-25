import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const W = 1200
const H = 630

// SVG overlay: dark gradient + text
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75"/>
    </linearGradient>
  </defs>

  <!-- dark overlay -->
  <rect width="${W}" height="${H}" fill="url(#grad)"/>

  <!-- jeremykim.fr -->
  <text
    x="72" y="72"
    font-family="Georgia, serif"
    font-size="22"
    fill="#ffffff"
    opacity="0.6"
    letter-spacing="2"
  >jeremykim.fr</text>

  <!-- Name -->
  <text
    x="72" y="430"
    font-family="Georgia, serif"
    font-size="80"
    font-weight="bold"
    fill="#ffffff"
  >Jeremy Kim</text>

  <!-- Divider -->
  <rect x="72" y="455" width="60" height="3" fill="#ffffff" opacity="0.5"/>

  <!-- Description -->
  <text
    x="72" y="510"
    font-family="Georgia, serif"
    font-size="28"
    fill="#ffffff"
    opacity="0.85"
  >Freelance Fullstack Developer — Paris, France</text>

  <text
    x="72" y="550"
    font-family="Georgia, serif"
    font-size="22"
    fill="#ffffff"
    opacity="0.6"
  >Creative web development &amp; interactive experiences</text>
</svg>
`

await sharp(path.join(root, 'public/train.jpg'))
  .resize(W, H, { position: 'centre' })
  .composite([{ input: Buffer.from(svg), blend: 'over' }])
  .jpeg({ quality: 90 })
  .toFile(path.join(root, 'public/og-image.jpg'))

console.log('✓ public/og-image.jpg generated')
