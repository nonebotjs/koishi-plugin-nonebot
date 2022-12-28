import { Context, Logger, makeArray, segment } from 'koishi'
import { Driver } from './driver'
import { BaseMatcher, CommandMatcher, MessageMatcher } from './matcher'
import { kwarg, unwrap } from './utils'

export class Internal {
  public caller: Context
  public logger = Object.assign(Object.create(new Logger('nonebot')), {
    warning(...args: any[]) {
      return this.warn(...args)
    }
  })

  constructor(protected ctx: Context) {}

  h(type: string, attrs?: any, children?: any) {
    attrs = Object.fromEntries(attrs?.toJs().entries() ?? [])
    children = children?.toJs().map(item => {
      if (!(item instanceof Map)) return unwrap(item)
      if (item.get('type') === 'node') {
        const element = segment('message', unwrap(item.get('data').get('content')))
        element.children.forEach((item) => {
          if (item.type === 'image' && item.attrs.file) {
            item.attrs.url = item.attrs.file
            delete item.attrs.file
          }
        })
        element.children.unshift(segment('author', {
          userId: item.get('data').get('uin'),
          nickname: item.get('data').get('name'),
        }))
        return element
      } else {
        throw new Error('invalid content:' + item)
      }
    })
    return segment(type, attrs, children)
  }

  get_driver() {
    return new Driver(this.caller)
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

  on_keyword(text: string | string[]) {
    const words = makeArray(unwrap(text))
    return new MessageMatcher(this.ctx, message => words.some(word => message.includes(word)))
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
