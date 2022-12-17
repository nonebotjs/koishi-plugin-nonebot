import { defineTheme } from '@koishijs/vitepress/client'
import home from '@theme-default/components/VPHome.vue'

import './home.scss'

export default defineTheme({
  layouts: {
    home,
  },
})
