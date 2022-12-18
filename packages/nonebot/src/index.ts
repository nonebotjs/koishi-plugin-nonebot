import { Context, Logger, Schema, Service } from 'koishi'
import mkdirp from 'mkdirp'
import { basename, join } from 'node:path'
import type { PyodideInterface } from 'pyodide'
import { loadPyodide } from 'pyodide'
import * as modules from './modules'

const logger = new Logger('nonebot')

declare module 'koishi' {
  interface Context {
    nonebot: NoneBot
  }
}

class NoneBot extends Service {
  python: PyodideInterface
  installed: string[] = []

  constructor(protected ctx: Context, protected config: NoneBot.Config) {
    super(ctx, 'nonebot')
  }

  async start() {
    this.python = await loadPyodide({
      stdout: logger.info,
      stderr: logger.warn,
      fullStdLib: false,
      homedir: '/pyodide',
    })

    await mkdirp(this.config.packagesFolder)
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root: this.config.packagesFolder },
      '/lib/python3.10/site-packages/'
    )

    this.python.registerJsModule('nonebot', new modules.NoneBot(this.ctx))
    this.python.pyimport('nonebot')
  }

  async import(pathModule: string, pathDeps: string) {
    const name = basename(pathModule)

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const deps = require(join(pathDeps, 'deps.json'))
    for (const dep of deps) await this.install(pathDeps, dep.name, dep.filename)

    const pathVFSModule = `/pyodide/${name}/`
    this.python.FS.mkdirTree(pathVFSModule)
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root: pathModule },
      pathVFSModule
    )
    this.python.pyimport(name)
  }

  private async install(pathDeps: string, name: string, filename: string) {
    if (this.installed.includes(name)) return

    await this.python.loadPackage(
      join(pathDeps, filename),
      logger.info,
      logger.warn
    )
    this.installed.push(name)
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
