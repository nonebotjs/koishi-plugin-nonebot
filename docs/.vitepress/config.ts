import { defineConfig } from '@koishijs/vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'koishi-plugin-nonebot',
  description: '在 Koishi 中使用 NoneBot 插件',

  head: [
    ['link', { rel: 'icon', href: '/icon.png' }],
    ['link', { rel: 'manifest', href: 'https://koishi.chat/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#5546a3' }],
  ],

  themeConfig: {
    nav: [
      { text: '插件', link: './plugins' },
      { text: 'API', link: './api' },
      { text: '配置项', link: './config' },
      {
        text: '更多',
        items: [
          { text: 'Koishi 官网', link: 'https://koishi.chat' },
          { text: 'NoneBot 官网', link: 'https://v2.nonebot.dev' },
        ],
      }
    ],

    sidebar: [{
      text: '指南',
      items: [
        { text: '介绍', link: './' },
        { text: '插件', link: './plugins' },
        { text: 'API', link: './api' },
        { text: '配置项', link: './config' },
      ],
    }, {
      text: '更多',
      items: [
        { text: 'Koishi 官网', link: 'https://koishi.chat' },
        { text: 'NoneBot 官网', link: 'https://v2.nonebot.dev' },
      ],
    }],

    socialLinks: {
      github: 'https://github.com/nonebotjs/koishi-plugin-nonebot',
    },

    editLink: {
      pattern: 'https://github.com/nonebotjs/koishi-plugin-nonebot/edit/main/docs/:path',
    },

    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2022-present NoneBot.js Team',
    },
  },
})
