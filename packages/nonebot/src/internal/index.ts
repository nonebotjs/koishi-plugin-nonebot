import { Context, Logger, makeArray, segment } from 'koishi'
import { Driver } from './driver'
import { BaseMatcher, CommandMatcher, MessageMatcher } from './matcher'
import { rest, take, unwrap } from './utils'

export class Internal {
  public caller: Context
  public config: {}

  public logger = Object.assign(Object.create(new Logger('nonebot')), {
    warning(...args: any[]) {
      return this.warn(...args)
    },
  })

  constructor(protected ctx: Context) {}

  h(type: string, attrs?: any, children?: any) {
    if (type === 'music') type = 'onebot:music'
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
    // resolve virtual path
    if (typeof attrs.url === 'string' && attrs.url.startsWith('file:///')) {
      attrs.url = 'file:///' + this.ctx.nonebot.resolvePath(attrs.url.slice(8))
    }
    return segment(type, attrs, children)
  }

  get_driver() {
    return new Driver(this.caller, this.config)
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

  on_message(kwargs = {}) {
    return new MessageMatcher(this.ctx, kwargs, () => true)
  }

  on_startswith(text: string, kwargs = {}) {
    return new MessageMatcher(this.ctx, kwargs, message => message.startsWith(text))
  }

  on_endswith(text: string, kwargs = {}) {
    return new MessageMatcher(this.ctx, kwargs, message => message.endsWith(text))
  }

  on_fullmatch(text: string, kwargs = {}) {
    return new MessageMatcher(this.ctx, kwargs, message => message === text)
  }

  on_keyword(text: string | string[], kwargs = {}) {
    const words = makeArray(unwrap(text))
    return new MessageMatcher(this.ctx, kwargs, message => words.some(word => message.includes(word)))
  }

  on_regex(...args: any[]) {
    const regexp = new RegExp(take('pattern', args))
    return new MessageMatcher(this.ctx, rest(args), message => regexp.exec(message))
  }

  on_command(...args: any[]) {
    return new CommandMatcher(this.ctx, take('cmd', args), rest(args))
  }

  on_shell_command(name: string) {
    return new BaseMatcher(this.ctx)
  }
}
