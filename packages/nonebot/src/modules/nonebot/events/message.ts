import {KoishiSession} from "../internal/session";


export class MessageEvent {
  protected message: string;
  protected session: KoishiSession;

  constructor(body: {
    message: string,
    session: KoishiSession
  }) {
    this.message = body.message
    this.session = body.session
  }

  get_message() {
    return this.message
  }

  $get_session() {
    // Private API , only for internal use
    return this.session
  }
}
