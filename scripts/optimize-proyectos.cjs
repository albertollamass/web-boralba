const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'public', 'images', 'proyectos')
const outDir = path.join(dir, 'webp')

fs.mkdirSync(outDir, { recursive: true })

;(async () => {
  const files = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f))
  for (const f of files) {
    const src = path.join(dir, f)
    const meta = await sharp(src).metadata()
    const width = Math.min(meta.width, 1200)
    const out = path.join(outDir, f.replace(/\.jpe?g$/i, '.webp'))
    await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(out)
    const before = fs.statSync(src).size
    const after = fs.statSync(out).size
    console.log(`${f}: ${meta.width}x${meta.height} -> ${(after / 1024).toFixed(0)}KB (${(before / 1024).toFixed(0)}KB original, -${(100 - (after / before) * 100).toFixed(0)}%)`)
  }
})()
