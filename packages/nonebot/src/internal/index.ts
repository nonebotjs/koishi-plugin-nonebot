import { Context, Logger, segment } from 'koishi'
import { PyProxy } from 'pyodide'
import { BaseMatcher, CommandMatcher, MessageMatcher } from './matcher'
import { kwarg, unwrap } from './utils'

export class Internal {
  public config: any
  public logger = Object.assign(Object.create(new Logger('nonebot')), {
    warning(...args: any[]) {
      return this.warn(...args)
    }
  })

  constructor(protected ctx: Context) {}

  h(type: string, attrs?: PyProxy, children?: PyProxy) {
    return segment(type, Object.fromEntries(attrs?.toJs().entries() ?? []), children?.toJs().map(unwrap))
  }

  get_driver() {
    return {
      config: {
        ...this.config,
        dict: () => new Map(Object.entries(this.config)),
      },
    }
  }

  on_message() {
    return new MessageMatcher(this.ctx, () => true)
  }

  on_metaevent() {
    return new BaseMatcher(this.ctx)
  }

  on_notice() {
    return new BaseMatcher(this.ctx)
  }

  on_request() {
    return new BaseMatcher(this.ctx)
  }

  on_startswith(text: string) {
    return new MessageMatcher(this.ctx, message => message.startsWith(text))
  }

  on_endswith(text: string) {
    return new MessageMatcher(this.ctx, message => message.endsWith(text))
  }

  on_fullmatch(text: string) {
    return new MessageMatcher(this.ctx, message => message === text)
  }

  on_keyword(text: string) {
    return new MessageMatcher(this.ctx, message => message.includes(text))
  }

  on_regex(...args: any[]) {
    const regexp = new RegExp(kwarg('pattern', args))
    return new MessageMatcher(this.ctx, message => regexp.test(message))
  }

  on_command(name: string) {
    return new CommandMatcher(this.ctx, name)
  }

  on_shell_command(name: string) {
    return new BaseMatcher(this.ctx)
  }
}
