export class ServerConfig {
  public static ip: string = "localhost"
  public static port: number = 5001;
  public static protocol: string = "wss";
  public static root: string = "/ws";
  public static getUrl() {
    return this.protocol + "://" + this.ip + ':' + this.port + this.root;
  }
}
