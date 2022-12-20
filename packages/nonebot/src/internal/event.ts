import { Session } from 'koishi'

export class NoneBotEvent {
  #session: Session

  constructor(session: Session) {
    this.#session = session
  }

  get group_id() {
    return this.#session.guildId
  }

  get_event_name() {
    return this.#session.subtype
  }

  get_message() {
    // TODO should be message
    return this.#session.content
  }

  get_plaintext() {
    return this.#session.content
  }

  get_session_id() {
    return `${this.#session.userId}:${this.#session.channelId}`
  }

  get_type() {
    return this.#session.type
  }

  get_user_id() {
    return this.#session.userId
  }

  is_tome() {
    return this.#session.author?.isBot
  }

  to_koishi() {
    return this.#session
  }
}
