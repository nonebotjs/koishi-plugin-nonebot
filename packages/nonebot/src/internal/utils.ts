import { h } from 'koishi'
import { PyProxy } from 'pyodide'

export function extractText(elements: h[]) {
  return h.transform(elements, {
    default: false,
    text: true,
  }).join('')
}

export function isPyProxy(obj: any): obj is PyProxy {
  return !!obj.toJs
}

export function unwrap(obj: any) {
  if (!isPyProxy(obj)) return obj
  if (obj.type === 'Message') {
    return obj.toJs().map(item => item.internal)
  } else if (obj.type === 'MessageSegment') {
    return obj.internal
  }
  return obj.toJs()
}

export function kwarg(name: string, args: any[]) {
  if (!args[0]) return args[0]
  if (typeof args[0] !== 'object') return args[0]
  if (isPyProxy(args[0])) return unwrap(args[0])
  return args[0][name]
}

export interface Parameter {
  kind: Parameter.Kind
  name: string
  args: any[]
  kwargs: Map<string, any>
}

export namespace Parameter {
  export enum Kind {
    POSITIONAL_ONLY = 0,
    POSITIONAL_OR_KEYWORD = 1,
    VAR_POSITIONAL = 2,
    KEYWORD_ONLY = 3,
    VAR_KEYWORD = 4,
  }
}
