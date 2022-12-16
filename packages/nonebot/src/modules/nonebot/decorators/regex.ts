import { Context } from 'koishi'
import { MessageEvent } from '../events/message'

export class RegexDecorator {
  constructor(protected ctx: Context, protected regexp: RegExp) {}
  handle() {
    return (fn) => {
      const newFn = fn.toJs() // @TODO:GC
      this.ctx.middleware((session, next) => {
        if (session.content.search(this.regexp) >= 0) {
          try {
            newFn({
              async send(p) {
                await session.send(p.message)
              }
            }, new MessageEvent(session.content))
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
