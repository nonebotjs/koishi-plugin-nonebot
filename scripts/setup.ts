import { execSync } from 'child_process'
import { join, resolve } from 'path'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'

const fullname = process.argv[2]
const name = fullname.replace(/_/g, '-').slice(15)

const srcDir = resolve(__dirname, '../plugins/_template')
const destDir = resolve(__dirname, '..', 'plugins', name)

function copyFiles(path: string) {
  const dirents = readdirSync(resolve(srcDir, path), { withFileTypes: true })
  mkdirSync(resolve(destDir, path))
  for (const dirent of dirents) {
    const src = join(srcDir, path, dirent.name)
    const dest = join(destDir, path, dirent.name)
    if (dirent.isDirectory()) {
      copyFiles(join(path, dirent.name))
    } else if (dirent.isFile()) {
      const content = readFileSync(src, 'utf-8')
      writeFileSync(dest, content
        .replace(/nonebot_plugin_template/g, fullname)
        .replace(/template/g, name)
        .replace(/ {2}"private": true,\r?\n/g, ''))
    }
  }
}

async function main() {
  copyFiles('')
  execSync(`git submodule add https://github.com/nonebotjs/${fullname} plugins/${name}/${fullname}`, { stdio: 'inherit' })
}

if (module === require.main) {
  main().then()
}
