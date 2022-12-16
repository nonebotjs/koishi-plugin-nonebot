export class MessageEvent {
  constructor(protected message: string) {
  }

  get_message() {
    return this.message
  }
}

