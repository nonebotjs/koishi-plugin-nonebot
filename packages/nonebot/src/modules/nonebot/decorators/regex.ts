import { Context } from 'koishi'
import type { PyProxy } from 'pyodide'
import { NoneBotBot } from '../bot'
import { NoneBotEvent } from '../event'

export class RegexDecorator {
  constructor(protected ctx: Context, protected regexp: RegExp) {}

  handle() {
    return (fn: PyProxy) => {
      const newFn = fn.toJs() // @TODO:GC
      this.ctx.middleware((session, next) => {
        if (session.content.search(this.regexp) >= 0) {
          try {
            newFn(new NoneBotBot(session.bot), new NoneBotEvent(session))
          } catch (e) {
            console.error(e)
          }
          return
        }
        return next()
      })
    }
  }
}
