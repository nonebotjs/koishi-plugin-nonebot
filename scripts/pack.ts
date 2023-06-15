import del from 'del'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { register, spawnAsync } from 'yakumo'

register('nbp-pack', async (project) => {
  const pathDist = resolve(__dirname, '../build/dist')
  await del(pathDist)
  await mkdir(pathDist, { recursive: true })

  await Promise.all(
    Object.keys(project.targets)
      .filter(
        (path) =>
          (path.startsWith('/plugins') && !path.includes('_template'))
          || path === '/packages/nonebot',
      )
      .map((path) => project.targets[path])
      .map((pkgJson) =>
        spawnAsync([
          'yarn',
          'workspace',
          pkgJson.name,
          'pack',
          '-f',
          join(
            pathDist,
            `${pkgJson.name
              .replace('@nonebot/', '')
              .replace('koishi-plugin-', '')}-${pkgJson.version}.tgz`,
          ),
        ]),
      ),
  )
})
