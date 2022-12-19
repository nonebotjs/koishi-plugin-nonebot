import { Context, segment } from 'koishi'
import { MessageMatcher } from './matcher'

export class NoneBot {
  constructor(protected ctx: Context) {}

  get_driver() {
    return {
      config: {
        dict: () => new Map(),
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

  on_regex(pattern: string) {
    const regexp = new RegExp(pattern)
    return new MessageMatcher(this.ctx, message => regexp.test(message))
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
  }
}
