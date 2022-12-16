import { Context, Logger, Schema, Service } from 'koishi'
import { loadPyodide, PyodideInterface } from 'pyodide'
import * as modules from './modules'
import fetch from 'node-fetch'
import { basename } from 'path'

if (!globalThis.fetch) {
  globalThis.fetch = fetch as any
}

const logger = new Logger('nonebot')

declare module 'koishi' {
  interface Context {
    nonebot: NoneBot
  }
}

class NoneBot extends Service {
  python: PyodideInterface

  constructor(protected ctx: Context, protected config: NoneBot.Config) {
    super(ctx, 'nonebot')
  }

  async start() {
    this.python = await loadPyodide({
      stdout: logger.info,
      stderr: logger.warn,
    })
    const root = this.config.packagesFolder
    this.python.FS.mount(this.python.FS.filesystems.NODEFS, { root }, '/lib/python3.10/site-packages/')
    this.python.registerJsModule('nonebot', new modules.NoneBot(this.ctx))
    await this.python.loadPackage(['pydantic', 'micropip'], logger.info, logger.warn)
    this.python.pyimport('pydantic')
    this.python.pyimport('nonebot')
  }

  import(root: string) {
    const name = basename(root)
    this.python.FS.mkdir(`/home/pyodide/${name}/`)
    this.python.FS.mount(this.python.FS.filesystems.NODEFS, { root }, `/home/pyodide/${name}/`)
    this.python.pyimport(name)
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
    packagesFolder: Schema.string().description('site-packages 目录。').default('data/nonebot/site-packages'),
  })
}

export default NoneBot
