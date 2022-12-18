import { Context } from 'koishi'
import type { PyProxy } from 'pyodide'
import { NoneBotBot } from './bot'
import { NoneBotEvent } from './event'
import { extractText } from './utils'

export class MessageMatcher {
  constructor(protected ctx: Context, protected predicate: (text: string) => boolean) {}

  handle() {
    return (fn: PyProxy) => {
      const callback = fn.toJs()
      this.ctx.on('message', (session) => {
        if (!this.predicate(extractText(session.elements))) return
        callback(new NoneBotBot(session.bot), new NoneBotEvent(session))
      })
    }
  }
}
