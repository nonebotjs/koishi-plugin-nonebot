import { h } from 'koishi'

export function extractText(elements: h[]) {
  return h.transform(elements, {
    default: false,
    text: true,
  }).join('')
}

export function kwarg(name: string, args: any[]) {
  return typeof args[0] === 'string' ? args[0] : args[0][name]
}

export interface Parameter {
  name: string
  kind: Parameter.Kind
  key: string
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
