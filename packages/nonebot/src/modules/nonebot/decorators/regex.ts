import {Context} from 'koishi'
import {MessageEvent} from '../events/message'
import {NonebotBot} from "../adapter/bot";

export class RegexDecorator {
  constructor(protected ctx: Context, protected regexp: RegExp) {
  }

  handle() {
    return (fn) => {
      const newFn = fn.toJs() // @TODO:GC
      this.ctx.middleware((session, next) => {
        if (session.content.search(this.regexp) >= 0) {
          try {
            newFn(
              new NonebotBot(this.ctx, session.bot)
              , new MessageEvent({
                message: session.content,
                session: {
                  botId: session.bot.platform + ':' + session.bot.selfId,
                  guildId: session.guildId,
                  channelId: session.channelId,
                  userId: session.userId,
                  message: session.content
                }
              }))
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
