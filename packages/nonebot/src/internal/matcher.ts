import { Context, Dict, h, Logger, Session } from 'koishi'
import type { PyProxy } from 'pyodide'
import { extractText, kwarg, Parameter, unwrap } from './utils'

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

const fallbackMap = {
  'MessageEvent': 'Event',
  'GroupMessageEvent': 'Event',
  'PrivateMessageEvent': 'Event',
  'T_State': 'State',
  'ArgPlainText': 'ArgStr',
}

export class BaseMatcher {
  protected session: Session
  protected state = new Map()
  protected callbacks: (() => Promise<void>)[] = []
  protected message: string

  protected getters = {
    Bot: () => {
      const { Bot } = this.ctx.nonebot.python.pyimport('nonebot.adapters.onebot.v11')
      return Bot(this.session.bot, (data) => {
        return unwrap(data)
      })
    },
    Event: () => {
      const module = this.ctx.nonebot.python.pyimport('nonebot.adapters.onebot.v11')
      const constructor = this.session.type === 'message'
        ? this.session.guildId ? module.GroupMessageEvent : module.PrivateMessageEvent
        : module.Event
      return constructor(this.session)
    },
    State: () => this.state,
    Matcher: (): BaseMatcher => this,
    ArgStr: ([name]: string[]) => this.state.get(name),
    CommandArg: () => {
      const { create_message } = this.ctx.nonebot.python.pyimport('nonebot.adapters.onebot.v11')
      return create_message(h.parse(this.message))
    },
  }

  constructor(protected ctx: Context) {}

  protected getParams(fn: PyProxy): Parameter[] {
    const helpers = this.ctx.nonebot.python.pyimport('nonebot.helpers')
    const params = helpers.get_params(fn).toJs()
    return params.map((param) => ({
      kind: param.kind,
      name: param.name,
      args: param.args.toJs(),
      kwargs: param.kwargs.toJs(),
    }))
  }

  protected factory(action: (callback: () => Promise<void>) => Promise<void> = callback => callback()) {
    return (fn: PyProxy) => {
      const params: Parameter[] = this.getParams(fn)
      const callback = fn.toJs()
      this.callbacks.push(() => action(() => {
        const args = params.map((param) => {
          const key = fallbackMap[param.name] || param.name
          return this.getters[key]?.(param.args, param.kwargs)
        })
        return callback(...args)
      }))
    }
  }

  public set_arg(key: string, value: any) {
    const raw = unwrap(value)
    this.state.set(key, Array.isArray(raw) ? raw.join('') : raw)
  }

  public handle() {
    return this.factory()
  }

  public async send(...args: any[]) {
    const message = h.normalize(kwarg('message', args))
    if (kwarg('at_sender', args, 1)) {
      message.unshift(h.at(this.session.userId))
    }
    await this.session.send(message)
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
        await callback()
      }
    } catch (e) {
      if (!NoneBotException.check(e)) logger.warn(e)
    }
  }
}

export class EventMatcher extends BaseMatcher {
  constructor(protected ctx: Context, event: string) {
    super(ctx)
    this.ctx.on(event as any, async (session: any) => {
      this.session = session
      this.state = new Map()
      await this.execute()
    })
  }
}

export class MessageMatcher extends BaseMatcher {
  constructor(protected ctx: Context, predicate: (text: string) => boolean) {
    super(ctx)
    this.ctx.middleware(async (session, next) => {
      if (!predicate(extractText(session.elements))) return next()
      this.session = session
      this.state = new Map()
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
      this.state = new Map()
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
