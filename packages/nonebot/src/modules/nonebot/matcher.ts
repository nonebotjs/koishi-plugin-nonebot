import { Context, Session } from 'koishi'
import type { PyProxy } from 'pyodide'
import { NoneBotBot } from './bot'
import { NoneBotEvent } from './event'
import { extractText, kwarg } from './utils'

export class MessageMatcher {
  session: Session

  constructor(protected ctx: Context, protected predicate: (text: string) => boolean) {}

  handle() {
    return (fn: PyProxy) => {
      const callback = fn.toJs()
      this.ctx.middleware(async (session, next) => {
        if (!this.predicate(extractText(session.elements))) return next()
        this.session = session
        await callback(new NoneBotBot(session.bot), new NoneBotEvent(session))
      })
    }
  }

  finish(...args: any[]) {
    return this.session.send(kwarg('message', args))
  }
}

interface PromptOptions {
  prompt?: string
}

export class CommandMatcher {
  session: Session
  args: string[]

  constructor(protected ctx: Context, protected name: string) {}

  handle() {
    return (fn: PyProxy) => {
      const callback = fn.toJs()
      this.ctx.command(this.name).action(async({ session }, ...args) => {
        const state = new Map([['a', 1]])
        this.session = session
        await callback(args.join(' '), state)
      })
    }
  }

  reject(arg: string | { prompt: string }) {
    return this.session.send(typeof arg === 'string' ? arg : arg.prompt)
  }

  got(name: string, { prompt }: PromptOptions = {}) {
    return (fn: PyProxy) => {
      const callback = fn.toJs()
    }
  }
}
