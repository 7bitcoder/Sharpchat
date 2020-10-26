export class Chatprotocol {
  constructor(
    public command:
      "message" |
      "writing" |
      "ping" |
      "stopWriting" |
      "newClient"|
      "findStranger"|
      "userId"|
      "strangerFound"|
      "reconnect"|
      "reconnected"|
      "close" |
      "strangerDisconnected"|
      "strangerClosed",
    public data: string
  ) { }
}
