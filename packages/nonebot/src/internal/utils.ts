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

export function kwarg(name: string, args: any[]) {
  if (!args[0]) return args[0]
  if (typeof args[0] !== 'object') return args[0]
  if (isPyProxy(args[0])) return args[0].toJs()
  return args[0][name]
}

export interface Parameter {
  name: string
  kind: Parameter.Kind
  type: string
  args: any[]
  kwargs: any
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
