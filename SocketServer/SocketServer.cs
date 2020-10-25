using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SharpChat.SocketServer
{
    class Data
    {
        public string command { get; set; }
        public string data { get; set; }
    }
    public class SocketServer
    {
        static SocketServer server = new SocketServer();

        MatchMaking mm = new MatchMaking();
        public static SocketServer getSocketServer()
        {
            return server;
        }
        private SocketServer()
        {
            mm.run();
        }

        public async void handleUser(HttpContext context, WebSocket webSocket, TaskCompletionSource<object> end)
        {
            try
            {
                var handler = new UserHandler(webSocket);
                await handler.handle();
            }
            catch (Exception e)
            {

            }
            finally
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.Empty, null, CancellationToken.None);
                end.TrySetResult(new object());
            }
        }
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
    }

    class Lobby
    {
        public Guid lobbyId { set; get; }
        public UserHandler first { set; get; }
        public UserHandler second { set; get; }
    }
    class UserHandler
    {
        internal static Dictionary<Guid, Lobby> lobbys = new Dictionary<Guid, Lobby>();
        private byte[] bufferR = new byte[1024 * 4];
        private byte[] bufferS = new byte[1024 * 4]; //send receive buffer
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
            await sendData(new Data { command = "giveId", data = user.uid.ToString() });
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
                case "searchForStranger":
                    MatchMaking.queue.Add(this);
                    break;
                case "giveId":
                case "ping":
                default:
                    break;
            }
        }
    }

    class MatchMaking
    {
        internal static BlockingCollection<UserHandler> queue = new BlockingCollection<UserHandler>();
        public async Task<bool> run()
        {
            return await Task<bool>.Run(() =>
            {
                while (true)
                {
                    UserHandler uh1 = queue.Take();
                    Console.WriteLine("one gett");
                    UserHandler uh2 = queue.Take();
                    Console.WriteLine("2 gett");
                    var lobby = new Lobby() { lobbyId = Guid.NewGuid(), first = uh1, second = uh2 };
                    uh1.lobby = lobby;
                    uh2.lobby = lobby;
                    UserHandler.lobbys.Add(lobby.lobbyId, lobby);
                    var msg = new Data { command = "giveLobbyId", data = lobby.lobbyId.ToString() };
                    uh1.sendData(msg);
                    uh2.sendData(msg);
                }
                return true;
            });
        }
    }
}
