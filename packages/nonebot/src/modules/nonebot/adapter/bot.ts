import {Bot, Context} from "koishi";
import {KoishiSession} from "../internal/session";

export class NonebotBot {
  constructor(protected ctx: Context, protected bot: Bot) {
  }

  async send(data: { session: KoishiSession, message }) {
    if (data.session.guildId)
      await this.ctx.bots[data.session.botId].sendMessage(data.session.channelId, data.message)
    else
      await this.ctx.bots[data.session.botId].sendPrivateMessage(data.session.userId, data.message)
  }
}
