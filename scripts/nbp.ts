import { createReadStream } from 'node:fs'
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import stream from 'node:stream'
import { promisify } from 'node:util'
import { extract } from 'tar'
import bz2 from 'unbzip2-stream'
import { register } from 'yakumo'
import { jiebaSource, namePil, namePyyaml, pyodideSource } from './config'
import type { Nbp } from './types'
import { download, exists, spawnOutput } from './utils'

const blacklist = [
  'nonebot-adapter-onebot',
  'nonebot2',
  'httpx',
  'aiohttp',
  'pydantic',
  'build',
  'twine',
  'jieba',
]

interface JohnnydepItem {
  name: string
  version_latest_in_spec: string
  download_link: string
  requires: string[]
}

const blacklisted = (x: string) =>
  !blacklist.some(
    (y) => x.split('<')[0].split('>')[0].split('=')[0].split('!')[0] === y
  )

const preparePyodide = async () => {
  const pathCache = resolve(__dirname, '../build/cache')
  const pathFile = join(pathCache, 'pyodide.tar.bz2')
  await mkdir(pathCache, { recursive: true })

  if (!(await exists(pathFile)))
    await download(pyodideSource, pathCache, 'pyodide.tar.bz2')

  const pathExtracted = join(pathCache, 'pyodide')
  await mkdir(pathExtracted, { recursive: true })
  if (!(await exists(join(pathExtracted, 'pyodide.js'))))
    await promisify(stream.finished)(
      createReadStream(pathFile)
        .pipe(bz2())
        .pipe(extract({ cwd: pathExtracted, strip: 1 }))
    )

  return pathExtracted
}

const prepareJieba = async () => {
  const pathCache = resolve(__dirname, '../build/cache')
  const pathFile = join(pathCache, 'jieba.tar.gz')
  await mkdir(pathCache, { recursive: true })

  if (!(await exists(pathFile)))
    await download(jiebaSource, pathCache, 'jieba.tar.gz')

  const pathExtracted = join(pathCache, 'jieba')
  await mkdir(pathExtracted, { recursive: true })
  if (!(await exists(join(pathExtracted, 'setup.py'))))
    await promisify(stream.finished)(
      createReadStream(pathFile).pipe(extract({ cwd: pathExtracted, strip: 1 }))
    )

  return join(pathExtracted, 'jieba')
}

const buildNonebot = async () => {
  const pathPyodide = await preparePyodide()
  const pathJieba = await prepareJieba()

  const pathPackage = resolve(__dirname, '../packages/nonebot')
  const pathDist = join(pathPackage, 'dist')

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })

  await Promise.all(
    [namePyyaml, namePil].map((x) =>
      cp(join(pathPyodide, x), join(pathDist, x))
    )
  )

  await writeFile(
    join(pathDist, 'deps.json'),
    JSON.stringify([
      {
        name: 'yaml',
        filename: namePyyaml,
      },
      {
        name: 'PIL',
        filename: namePil,
      },
    ])
  )

  const pathDistJieba = join(pathDist, 'jieba')
  await mkdir(pathDistJieba, { recursive: true })
  await cp(pathJieba, pathDistJieba, { recursive: true })
}

const buildPlugin = async (path: string) => {
  const pathPackage = resolve(__dirname, `..${path}`)
  const pathDist = join(pathPackage, 'dist')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nbp: Nbp = require(join(pathPackage, 'nbp.json'))

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })

  // Parents of each cycle
  let parents: string[] = [`${nbp.name}==${nbp.version}`]
  // Finally collected deps
  const deps: JohnnydepItem[] = []

  while (parents.length) {
    // Collected results
    const results: JohnnydepItem[][] = []

    // Collect
    for (const parent of parents)
      results.push(
        JSON.parse(
          await spawnOutput('python3', [
            '-m',
            'johnnydep',
            '-f',
            'ALL',
            '-o',
            'json',
            '--no-deps',
            parent,
          ])
        )
      )

    // Filter requirements of results info parents of next cycle
    parents = results
      .map((result) => result[0].requires.filter(blacklisted))
      .flat()

    // Push deps
    results.flat().forEach((x) => deps.push(x))
  }

  const resultDeps = deps.slice(1).map((x) => ({
    name: x.name,
    version: x.version_latest_in_spec,
    filename: basename(x.download_link),
    url: x.download_link,
  }))

  await Promise.all(
    resultDeps.map((x) => download(x.url, pathDist, x.filename))
  )

  await writeFile(
    join(pathDist, 'deps.json'),
    JSON.stringify(
      resultDeps.map((x) => ({ name: x.name, filename: x.filename }))
    )
  )
}

register('nbp', (project) =>
  Promise.all([
    ...Object.keys(project.targets)
      .filter(
        (path) => path.startsWith('/plugins') && !path.includes('_template')
      )
      .map(buildPlugin),
    buildNonebot(),
  ])
)
