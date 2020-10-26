using Newtonsoft.Json;
using System;
using System.IO;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SharpChat.SocketServer
{
    public class UserP
    {
        public int age { get; set; }
        public string sex { get; set; }
    }

    public class StrangerP
    {
        public string sex { get; set; }
    }

    public class Preferences
    {
        public UserP user { get; set; }
        public StrangerP stranger { get; set; }
    }

    class User
    {
        private Guid uid_ = Guid.NewGuid();
        public Guid uid { get { return uid_; } set { uid_ = value; } }

        public Guid lobbyId { get; set; }
        public WebSocket webSocket { get; set; }
        internal User(WebSocket webSocket_)
        {
            webSocket = webSocket_;
        }
        internal Preferences preferences { get; set; }
    }
    class UserHandler
    {
        private byte[] bufferR = new byte[1024 * 4];
        internal User user;
        internal Lobby lobby;
        private SemaphoreSlim semaphore = new SemaphoreSlim(1);

        internal UserHandler(WebSocket webSocket_)
        {
            user = new User(webSocket_);
        }
        internal async Task<bool> handle()
        {
            Console.WriteLine($"new user: id {user.uid.ToString()}");
            while (true)
            {
                var dataTuple = await getString();// (stringData, connectionClosed)
                if (dataTuple.closed)
                    break;
                Data data = JsonConvert.DeserializeObject<Data>(dataTuple.data);
                analyzeData(data, dataTuple.data);
                Console.WriteLine($"command: {data.command} data: {data.data}");
            }
            Console.WriteLine("closing");
            return true;
        }

        private async Task<(String data, bool closed)> getString()
        {
            WebSocketReceiveResult result;
            var array = new ArraySegment<byte>(bufferR);
            using (var ms = new System.IO.MemoryStream())
            {
                do
                {
                    result = await user.webSocket.ReceiveAsync(array, CancellationToken.None);
                    ms.Write(array.Array, array.Offset, result.Count);
                    if (result.CloseStatus.HasValue)
                        return ("", true);
                }
                while (!result.EndOfMessage);

                ms.Seek(0, SeekOrigin.Begin);
                using (var reader = new StreamReader(ms, Encoding.UTF8))
                    return (reader.ReadToEnd(), false);
            }
        }

        private async Task<(Data data, bool closed)> getData()
        {
            var dataTuple = await getString();
            return (JsonConvert.DeserializeObject<Data>(dataTuple.data), dataTuple.closed);
        }

        internal async Task<bool> sendString(String data)
        {
            var bytes = Encoding.UTF8.GetBytes(data);
            await semaphore.WaitAsync();
            Console.WriteLine($"sending data {data}");
            await user.webSocket.SendAsync(new ArraySegment<byte>(bytes, 0, bytes.Length), WebSocketMessageType.Text, true, CancellationToken.None);
            semaphore.Release();
            return true;
        }

        internal async Task<bool> sendData(Data data)
        {
            var str = JsonConvert.SerializeObject(data);
            await sendString(str);
            return true;
        }

        private async void analyzeData(Data data, String rawData)
        {
            switch (data.command)
            {
                case "message":
                case "writing":
                case "stopwriting":
                    var l = this == lobby.first ? lobby.second : lobby.first;
                    await l.sendString(rawData);
                    Console.WriteLine("ready To send");
                    break;
                case "newClient":
                    this.user.preferences = JsonConvert.DeserializeObject<Preferences>(data.data);
                    await sendData(new Data { command = "userId", data = user.uid.ToString() });
                    break;
                case "findStranger":
                    MatchMaking.add(this);
                    break;
                case "reconnect":
                case "reconnected":
                case "close":
                case "strangerDisconnected":
                case "strangerClosed":
                case "userId":
                case "strangerFound":
                case "ping":
                default:
                    break;
            }
        }
    }
}
