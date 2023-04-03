import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'randomtkk'
export const using = ['nonebot']

export interface Config {
  tkk_path: string
  easy_size: number
  normal_size: number
  hard_size: number
  extreme_size: number
  max_size: number
}

export const Config: Schema<Config> = Schema.object({
  tkk_path: Schema.string().description('读取文案的路径 (相对于插件源码目录)。').default('resource'),
  easy_size: Schema.number().description('难度系数 (简单)。').default(10),
  normal_size: Schema.number().description('难度系数 (普通)。').default(20),
  hard_size: Schema.number().description('难度系数 (困难)。').default(40),
  extreme_size: Schema.number().description('难度系数 (极限)。').default(60),
  max_size: Schema.number().description('难度系数 (最大值)。').default(80),
})

export async function apply(ctx: Context, config: Config) {
  const { Path } = ctx.nonebot.python.pyimport('pathlib')
  const srcPath = resolve(__dirname, '../nonebot_plugin_randomtkk/nonebot_plugin_randomtkk')
  const tmpPath = ctx.nonebot.mountTemp(resolve(srcPath, config.tkk_path))
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(srcPath, {
    ...config,
    tkk_path: Path(tmpPath),
  })
}
