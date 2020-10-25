export class Chatprotocol {
  constructor(
    public command:
      "message" |
      "writing" |
      "ping" |
      "stopwriting" |
      "giveId"|
      "searchForStranger"|
      "giveLobbyId",
    public data: string
  ) { }
}
