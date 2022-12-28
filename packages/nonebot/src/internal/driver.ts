import { Context } from 'koishi'
import { PyProxy } from 'pyodide'

export class Driver {
  public config: any

  constructor(protected caller: Context, config = caller.config) {
    this.config = {
      ...config,
      dict: () => new Map(Object.entries(config)),
    }
  }

  on_startup(fn: PyProxy) {
    this.caller.on('ready', fn.toJs())
  }

  on_shutdown(fn: PyProxy) {
    this.caller.on('dispose', fn.toJs())
  }
}
