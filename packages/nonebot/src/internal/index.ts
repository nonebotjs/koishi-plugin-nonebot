import { Context, Logger, segment } from 'koishi'
import { BaseMatcher, CommandMatcher, MessageMatcher } from './matcher'
import { kwarg } from './utils'

export class Internal {
  public config: any
  public logger = new Logger('nonebot')
  public Element = segment
  public noop = () => {}

  constructor(protected ctx: Context) {}

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
