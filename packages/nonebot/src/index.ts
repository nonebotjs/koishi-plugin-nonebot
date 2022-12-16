import { Context, Schema } from 'koishi'
import { NoneBotContainer } from './container'

export const name = 'nonebot'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export async function apply(ctx: Context) {
  let container = new NoneBotContainer(ctx)
  await container.start()
}
