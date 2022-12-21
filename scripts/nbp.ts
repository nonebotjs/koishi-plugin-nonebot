import { mkdir, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { register } from 'yakumo'
import type { Nbp } from './types'
import { download, exists, spawnOutput } from './utils'

const blacklist = [
  'nonebot-adapter-',
  'nonebot2',
  'httpx',
  'aiohttp',
  'pydantic',
]

const buildNonebot = async () => {
  const pathPackage = resolve(__dirname, '../packages/nonebot')
  const pathDist = join(pathPackage, 'dist')

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })
}

const buildPlugin = async (path: string) => {
  const pathPackage = resolve(__dirname, `..${path}`)
  const pathDist = join(pathPackage, 'dist')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nbp: Nbp = require(join(pathPackage, 'nbp.json'))

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })

  const directDeps = JSON.parse(
    await spawnOutput('python3', [
      '-m',
      'johnnydep',
      '-f',
      'requires',
      '-o',
      'json',
      '--no-deps',
      `${nbp.name}==${nbp.version}`,
    ])
  )[0].requires.filter(
    (x: string) =>
      !blacklist.some(
        (y) => x.split('<')[0].split('>')[0].split('=')[0].split('!')[0] === y
      )
  )

  if (!directDeps.length) {
    await writeFile(join(pathDist, 'deps.json'), '[]')
    return
  }

  let deps = []

  for (const d of directDeps)
    deps.push(
      JSON.parse(
        await spawnOutput('python3', [
          '-m',
          'johnnydep',
          '-f',
          'ALL',
          '-o',
          'json',
          d,
        ])
      ).map((x) => ({
        name: x.name,
        version: x.version_latest_in_spec,
        filename: basename(x.download_link),
        url: x.download_link,
      }))
    )

  deps = deps.flat()

  await Promise.all(deps.map((x) => download(x.url, pathDist, x.filename)))

  await writeFile(
    join(pathDist, 'deps.json'),
    JSON.stringify(deps.map((x) => ({ name: x.name, filename: x.filename })))
  )
}

register('nbp', (project) =>
  Promise.all([
    ...Object.keys(project.targets)
      .filter((path) => path.startsWith('/plugins'))
      .map(buildPlugin),
    buildNonebot(),
  ])
)
