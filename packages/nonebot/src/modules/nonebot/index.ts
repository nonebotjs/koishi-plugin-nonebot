import { Context, segment } from 'koishi'
import { CommandMatcher, MessageMatcher } from './matcher'
import { kwarg } from './utils'

export class NoneBot {
  public config: any

  constructor(protected ctx: Context) {}

  get_driver() {
    return {
      config: {
        dict: () => new Map(Object.entries(this.config)),
      },
    }
  }

  plugin = {
    on_startswith: this.on_startswith.bind(this),
    on_endswith: this.on_endswith.bind(this),
    on_fullmatch: this.on_fullmatch.bind(this),
    on_keyword: this.on_keyword.bind(this),
    on_regex: this.on_regex.bind(this),
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

  typing = {
    T_State() {},
  }

  adapters = {
    onebot: {
      v11: {
        Bot() {},
        Event() {},
        Message: {},
        MessageSegment: {
          image: (t: string) => segment.image(t).toString(),
        },
      },
    },
  }

  params = {
    T_State() {
      return {
        T_State: {},
      }
    },
    State() {
      return {
        T_State: {},
      }
    },
    CommandArg() {
      return {}
    },
  }
}
