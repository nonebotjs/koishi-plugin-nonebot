import { Bot } from 'koishi'
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
}
