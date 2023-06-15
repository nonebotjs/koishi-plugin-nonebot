import { Context, Dict, h, Logger, Session } from 'koishi'
import type { PyProxy } from 'pyodide'
import { extractText, Parameter, take, unwrap } from './utils'

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
  protected checkers: (() => Promise<boolean>)[] = []
  protected callbacks: (() => Promise<void>)[] = []
  protected message: string
  protected capture: RegExpExecArray
  protected errorCatch: PyProxy

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
    RegexGroup: () => this.capture.slice(1),
    RegexDict: () => this.capture.groups || {},
    RegexMatched: () => this.capture[0],
    Depends: ([callback]) => callback(),
  }

  constructor(protected ctx: Context, kwargs: any = {}) {
    this.errorCatch = this.ctx.nonebot.python.runPython(`
      from nonebot import logger

      def wrap_error_catch(func):
        wrapped = logger.catch(func)
        def error_catch_wrapper(*args, **kwargs):
          wrapped(*args, **kwargs)
        return error_catch_wrapper
      wrap_error_catch
    `)

    if (kwargs.handlers) {
      for (const handler of unwrap(kwargs.handlers)) {
        this.append_handler(handler)
      }
    }
    if (kwargs.rule) {
      for (const checker of unwrap(kwargs.rule.checkers)) {
        this.checkers.push(this.parseFn(checker))
      }
    }
  }

  protected getParams(fn: PyProxy): Parameter[] {
    const helpers = this.ctx.nonebot.python.pyimport('nonebot.helpers')
    const params = helpers.get_params(fn).toJs()
    return params.map((param) => {
      const result = {
        kind: param.kind,
        name: param.name,
        args: param.args.toJs(),
        kwargs: param.kwargs.toJs(),
      }
      if (param.name === 'Depends') {
        result.args = [this.parseFn(result.args[0])]
      }
      return result
    })
  }

  protected parseFn(fn: PyProxy) {
    const params: Parameter[] = this.getParams(fn)
    const callback = this.errorCatch(fn).toJs()
    return async () => {
      const args = await Promise.all(params.map((param) => {
        const key = fallbackMap[param.name] || param.name
        return this.getters[key]?.(param.args, param.kwargs)
      }))
      return await callback(...args)
    }
  }

  protected factory(action: (callback: () => Promise<void>) => Promise<void>) {
    const decorate = (fn: PyProxy) => {
      if (!fn.toJs) {
        const callback = this.callbacks.pop()
        this.callbacks.push(() => action(callback))
        return decorate
      }
      const callback = this.parseFn(fn)
      this.callbacks.push(() => action(() => callback()))
      return decorate
    }
    return decorate
  }

  public set_arg(key: string, value: any) {
    const raw = unwrap(value)
    this.state.set(key, Array.isArray(raw) ? raw.join('') : raw)
  }

  public handle() {
    return this.factory(callback => callback())
  }

  public append_handler(fn: PyProxy) {
    return this.handle()(fn)
  }

  public async send(...args: any[]) {
    const message = h.normalize(take('message', args))
    if (take('at_sender', args, 1)) {
      message.unshift(h.at(this.session.userId))
    }
    await this.session.send(message)
  }

  public async reject(...args: any[]) {
    await this.session.send(take('prompt', args))
    throw new NoneBotException('reject')
  }

  public async finish(...args: any[]) {
    await this.session.send(take('message', args))
    throw new NoneBotException('finish')
  }

  public stop_propagation() {}

  protected async execute(...args: any[]) {
    try {
      for (const checker of this.checkers) {
        const result = await checker()
        if (!result) return
      }
      for (const callback of this.callbacks) {
        await callback()
      }
    } catch (e: Error | any) {
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
  constructor(protected ctx: Context, kwargs: {}, predicate: (text: string) => any) {
    super(ctx, kwargs)
    this.ctx.middleware(async (session, next) => {
      try {
        this.capture = predicate(extractText(session.elements))
      } catch (err) {
        logger.warn(err)
      }
      if (!this.capture) return next()
      this.session = session
      this.state = new Map()
      await this.execute()
    })
  }
}

export class CommandMatcher extends BaseMatcher {
  protected args: Dict<any> = Object.create(null)

  constructor(protected ctx: Context, protected name: string, kwargs: any) {
    super(ctx, kwargs)
    const cmd = this.ctx.command(this.name.replace(/^[./]/, ''))
    if (kwargs.aliases) {
      for (const name of unwrap(kwargs.aliases)) {
        cmd.alias(name.replace(/^[./]/, ''))
      }
    }
    cmd.action(async ({ session }, ...args) => {
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
