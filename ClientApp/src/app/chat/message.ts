
export enum User { you, stranger, client, server };
export class Message {
    static idCounter: number = 0;
    public id: number;
    constructor(
        public user: User,
        public message: string[]
    ){
        this.id = Message.idCounter++;
    }
    public getUserString(): string{
        switch(this.user){
            case User.you:
                return "you";
            case User.stranger:
                return "stranger";
            case User.server:
                return "server";
            case User.client:
                return "client";
            default:
                return "";
        }
    }
    
    public getMessagePrefix(){
        return Message.getMessagePrefix(this.user);
    }

    public static getMessagePrefix(user: User){
        switch(user){
            case User.you:
                return "Ty";
            case User.stranger:
                return "Rozmówca";
            case User.server:
            case User.client:
                return "Robot";
            default:
                return "";
        }
    }
}
