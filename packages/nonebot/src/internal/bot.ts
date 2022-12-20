import { Bot, Dict } from 'koishi'
import { NoneBotEvent } from './event'

interface SendPayload {
  event: NoneBotEvent
  message: string
}

export class NoneBotBot {
  constructor(protected bot: Bot) {}

  async send({ event, message }: SendPayload) {
    const session = event.to_koishi()
    return session.send(message)
  }

  async call_api(api: string, params: Dict) {
    return this[api](params)
  }

  async get_friend_list(params: Dict) {
    return this.bot.getFriendList()
  }

  async get_group_info(params: Dict) {
    return this.bot.getGuild(params.group_id)
  }

  async get_group_list(params: Dict) {
    return this.bot.getGuildList()
  }

  async get_group_member_info(params: Dict) {
    return this.bot.getGuildMember(params.group_id, params.user_id)
  }

  async get_group_member_list(params: Dict) {
    const raw = await this.bot.getGuildMemberList(params.group_id)
    return raw.map((member) => ({
      card: '',
      user_id: member.userId,
      nickname: member.nickname,
      last_sent_time: 0,
    }))
  }
}
