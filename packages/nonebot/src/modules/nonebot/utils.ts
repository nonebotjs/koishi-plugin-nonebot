import { h } from 'koishi'

export function extractText(elements: h[]) {
  return h.transform(elements, {
    default: false,
    text: true,
  }).join('')
}
