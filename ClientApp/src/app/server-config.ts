export class ServerConfig {
    public static ip: string = "localhost"
    public static port: number = 8765;
    public static protocol: string = "ws"
    public static getUrl(){
        return this.protocol + "://" + this.ip + ':' + this.port;
    }
}
