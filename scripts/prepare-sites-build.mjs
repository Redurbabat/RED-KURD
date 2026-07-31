import { copyFile, mkdir } from 'node:fs/promises'

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true })
await copyFile(
  new URL('../sites/worker.js', import.meta.url),
  new URL('../dist/server/index.js', import.meta.url)
)
await copyFile(
  new URL('../sites/auth.js', import.meta.url),
  new URL('../dist/server/auth.js', import.meta.url)
)
