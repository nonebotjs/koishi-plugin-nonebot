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
