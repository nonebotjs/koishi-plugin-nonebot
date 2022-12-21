import { Context, Dict, Logger, Session } from 'koishi'
import type { PyProxy } from 'pyodide'
import { NoneBotBot } from './bot'
import { NoneBotEvent } from './event'
import { extractText, kwarg, Parameter } from './utils'

const logger = new Logger('nonebot')

export class NoneBotException extends Error {
  constructor(message: string) {
    super('[NBE] ' + message)
  }

  static check(e: any) {
    if (!(e instanceof Error)) return
    if (e.name !== 'PythonError') return
    if (!e.message.includes('JsException:')) return
    if (!e.message.includes('[NBE] ')) return
    return true
  }
}

export class BaseMatcher {
  protected session: Session
  protected state = new Map()
  protected callbacks: any[] = []
  protected message: string

  constructor(protected ctx: Context) {}

  protected factory(action: (callback: () => Promise<void>) => Promise<void> = callback => callback()) {
    return (fn: PyProxy) => {
      const params: Parameter[] = this.ctx.nonebot.python.pyimport('nonebot.helpers').get_params(fn).toJs()
      const callback = fn.toJs()
      this.callbacks.push(() => {
        const args = params.map((param, index) => {
          if (index === 0) param.key ??= 'bot'
          if (index === 1) param.key ??= 'event'
          switch (param.key) {
            case 'bot': return new NoneBotBot(this.session.bot)
            case 'event': return new NoneBotEvent(this.session)
            case 'state': return this.state
            case 'message': return this.message
          }
        })
        return action(() => callback(...args))
      })
    }
  }

  public handle() {
    return this.factory()
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
    const bot = new NoneBotBot(this.session.bot)
    const event = new NoneBotEvent(this.session)
    try {
      for (const callback of this.callbacks) {
        await callback(bot, event, ...args)
      }
    } catch (e) {
      if (!NoneBotException.check(e)) logger.warn(e)
    }
  }
}

export class MessageMatcher extends BaseMatcher {
  constructor(protected ctx: Context, predicate: (text: string) => boolean) {
    super(ctx)
    this.ctx.middleware(async (session, next) => {
      if (!predicate(extractText(session.elements))) return next()
      this.session = session
      await this.execute()
    })
  }
}

export class CommandMatcher extends BaseMatcher {
  protected args: Dict<any> = Object.create(null)

  constructor(protected ctx: Context, protected name: string) {
    super(ctx)
    this.ctx.command(this.name).action(async({ session }, ...args) => {
      this.session = session
      this.message = args.join(' ')
      await this.execute()
    })
  }

  got(name: string, { prompt }: any = {}) {
    return this.factory(async (callback) => {
      if (!this.state.get(name)) {
        if (prompt) await this.session.send(prompt)
        this.state.set(name, await this.session.prompt())
      }
      return callback()
    })
  }
}
