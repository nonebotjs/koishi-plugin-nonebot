import { Context, Dict, Session } from 'koishi'
import type { PyProxy } from 'pyodide'
import { NoneBotBot } from './bot'
import { NoneBotEvent } from './event'
import { extractText, kwarg } from './utils'

export class NoneBotException extends Error {
  constructor(message: string) {
    super('[NBE] ' + message)
  }
}

export class BaseMatcher {
  protected session: Session
  protected state = new Map()
  protected callbacks: any[] = []

  constructor(protected ctx: Context) {}

  public handle() {
    return (fn: PyProxy) => {
      this.callbacks.push(fn.toJs())
    }
  }

  public async send(...args: any[]) {
    await this.session.send(kwarg('message', args))
  }

  public async reject(...args: any[]) {
    await this.session.send(kwarg('prompt', args))
    throw new NoneBotException('reject')
  }

  public async finish(...args: any[]) {
    await this.session.send(kwarg('message', args))
    throw new NoneBotException('finish')
  }

  protected async execute(...args: any[]) {
    try {
      for (const callback of this.callbacks) {
        await callback(...args)
      }
    } catch (e) {
      console.log(e)
      if (!(e instanceof Error)) throw e
      if (e.name !== 'PythonError') throw e
      if (!e.message.includes('JsException:')) throw e
      if (!e.message.includes('[NBE] ')) throw e
    }
  }
}

export class MessageMatcher extends BaseMatcher {
  constructor(protected ctx: Context, predicate: (text: string) => boolean) {
    super(ctx)
    this.ctx.middleware(async (session, next) => {
      if (!predicate(extractText(session.elements))) return next()
      this.session = session
      await this.execute(new NoneBotBot(session.bot), new NoneBotEvent(session))
    })
  }
}

export class CommandMatcher extends BaseMatcher {
  protected args: Dict<any> = Object.create(null)

  constructor(protected ctx: Context, protected name: string) {
    super(ctx)
    this.ctx.command(this.name).action(async({ session }, ...args) => {
      this.session = session
      await this.execute(args.join(' '), this.state)
    })
  }

  got(name: string, { prompt }: any = {}) {
    return (fn: PyProxy) => {
      const callback = fn.toJs()
      this.callbacks.push(async () => {
        if (!this.state.get(name)) {
          if (prompt) await this.session.send(prompt)
          this.state.set(name, await this.session.prompt())
        }
        await callback(this.state)
      })
    }
  }
}
