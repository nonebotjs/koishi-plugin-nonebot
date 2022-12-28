import { mkdir } from 'node:fs/promises'
import { Context, Dict, Logger, Schema, Service } from 'koishi'
import { basename, join, resolve } from 'node:path'
import type { PyodideInterface } from 'pyodide'
import { loadPyodide } from 'pyodide'
import { Internal } from './internal'

if (!globalThis.fetch) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  globalThis.fetch = require('node-fetch')
}

const logger = new Logger('nonebot')

declare module 'koishi' {
  interface Context {
    nonebot: NoneBot
  }
}

interface Dependency {
  name: string
  filename: string
}

class NoneBot extends Service {
  public python: PyodideInterface
  public internal: Internal
  private importTask: Promise<void> = Promise.resolve()
  private installed: Dict<Promise<void>> = Object.create(null)

  constructor(protected ctx: Context, protected config: NoneBot.Config) {
    super(ctx, 'nonebot')
  }

  async start() {
    this.internal = new Internal(this.ctx)
    this.python = await loadPyodide({
      stdout: logger.info,
      stderr: logger.warn,
      fullStdLib: false,
      homedir: '/pyodide',
    })

    const root = resolve(this.ctx.baseDir, this.config.packagesFolder)
    await mkdir(root, { recursive: true })
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root },
      '/lib/python3.10/site-packages/'
    )

    await this.install(resolve(__dirname, '../dist'))
    await this.import(resolve(__dirname, '../dist/jieba'))

    this.python.registerJsModule('internal', this.internal)

    for (const name of ['aiohttp', 'httpx', 'nonebot', 'pydantic']) {
      this.mount(resolve(__dirname, `../python/${name}`))
    }
  }

  mount(pathModule: string) {
    const name = basename(pathModule).replace(/-/g, '_')
    const pathVFSModule = `/pyodide/${name}/`
    this.python.FS.mkdirTree(pathVFSModule)
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root: pathModule },
      pathVFSModule
    )
    return name
  }

  async install(pathDeps: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const deps: Dependency[] = require(join(pathDeps, 'deps.json'))
    await Promise.all(deps.map(dep => this.loadPackage(pathDeps, dep)))
  }

  async import(pathModule: string, config = {}) {
    const name = this.mount(pathModule)
    const caller = this.caller
    return this.importTask = this.importTask.then(async () => {
      this.internal.caller = caller
      await this.python.runPythonAsync(`import ${name}`)
      this.internal.caller = null
    })
  }

  private async loadPackage(pathDeps: string, dep: Dependency) {
    return this.installed[dep.name] ||= this.python.loadPackage(
      join(pathDeps, dep.filename),
      logger.info,
      logger.warn
    )
  }

  async stop() {
    // TODO
  }
}

namespace NoneBot {
  export interface Config {
    packagesFolder?: string
  }

  export const Config: Schema<Config> = Schema.object({
    packagesFolder: Schema.string()
      .description('site-packages 目录。')
      .default('data/nonebot/site-packages'),
  })
}

export default NoneBot
