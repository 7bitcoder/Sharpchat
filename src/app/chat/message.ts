export class Message {
    static idCounter: number = 0;
    public id: number;
    constructor(
        public user: "you" | "stranger" | "client" | "server",
        public message: string
    ){
        this.id = Message.idCounter++;
    }
}
