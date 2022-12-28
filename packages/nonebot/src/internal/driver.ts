import { Context } from 'koishi'
import { PyProxy } from 'pyodide'

export class Driver {
  public config: any

  constructor(protected caller: Context) {
    this.config = {
      ...caller.config,
      dict: () => new Map(Object.entries(caller.config)),
    }
  }

  on_startup(fn: PyProxy) {
    this.caller.on('ready', fn.toJs())
  }

  on_shutdown(fn: PyProxy) {
    this.caller.on('dispose', fn.toJs())
  }
}
