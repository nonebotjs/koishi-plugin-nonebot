import { Context, segment } from 'koishi'
import { RegexDecorator } from './decorators/regex'

export default class NoneBot {
  constructor(protected ctx: Context) {
  }

  get_driver() {
    return {
      config: {
        dict: () => new Map()
      },
    }
  }

  on_regex(regex) {
    return new RegexDecorator(this.ctx, new RegExp(regex))
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
          image: (t) => segment.image(t),
        }
      }
    }
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
