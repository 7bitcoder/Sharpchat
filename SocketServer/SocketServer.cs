using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
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
        public static SocketServer getSocketServer()
        {
            return server;
        }
        private SocketServer()
        { }

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
    class UserHandler
    {
        private byte[] bufferR = new byte[1024 * 4];
        private byte[] bufferS = new byte[1024 * 4]; //send receive buffer
        User user;
        private static SemaphoreSlim semaphore;

        internal UserHandler(WebSocket webSocket_)
        {
            user = new User(webSocket_);
        }
        internal async Task<bool> handle()
        {
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
                        return ("", false);
                }
                while (!result.EndOfMessage);

                ms.Seek(0, SeekOrigin.Begin);
                using (var reader = new StreamReader(ms, Encoding.UTF8))
                    return (reader.ReadToEnd(), true);
            }
        }

        private async Task<(Data data, bool closed)> getData()
        {
            var dataTuple = await getString();
            return (JsonConvert.DeserializeObject<Data>(dataTuple.data), dataTuple.closed);
        }

        private async Task<bool> sendString(String data)
        {
            var bytes = Encoding.UTF8.GetBytes(data);
            await semaphore.WaitAsync();
            await user.webSocket.SendAsync(new ArraySegment<byte>(bufferS, 0, bytes.Length), WebSocketMessageType.Text, true, CancellationToken.None);
            return true;
        }

        private async Task<bool> sendData(Data data)
        {
            var str = JsonConvert.SerializeObject(data);
            await sendString(str);
            return true;
        }

        private void analyzeData(Data data, String rawData)
        {
            switch (data.command)
            {
                case "message":
                case "writing":
                case "stopwriting":
                    //send raw to 
                    break;
                case "searchForStranger":

                    break;
                case "giveId":
                case "ping":
                default:
                    break;
            }
        }

        public static async Task<String> ReadString(WebSocket ws)
        {

        }
    }

    class MatchMaking
    {
        ConcurrentQueue<UserHandler> queue = new ConcurrentQueue<UserHandler>();
        public async Task<bool> run()
        {
            return await Task<bool>.Run(() =>
            {
                UserHandler uh;
                if (queue.TryDequeue(out uh))
                {

                }
                else
                {

                }
                queue.
                return true;
            });
        }
    }
}
