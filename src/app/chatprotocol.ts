export class Chatprotocol {
    constructor(
    public command:
    "message" | 
    "writing" | 
    "ping" |
    "stopwriting",
    public data: string
    ){}
}
