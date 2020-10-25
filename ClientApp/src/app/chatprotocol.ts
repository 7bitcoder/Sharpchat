export class Chatprotocol {
  constructor(
    public command:
      "message" |
      "writing" |
      "ping" |
      "stopwriting" |
      "giveId"|
      "searchForStranger",
    public data: string
  ) { }
}
