using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SharpChat.SocketServer
{
    public class SocketServer
    {
        static SocketServer server = new SocketServer();
        public static SocketServer getSocketServer()
        {
            return server;
        }
        private SocketServer()
        { }

        CancellationToken cts = new CancellationToken();
        public async void Echo(HttpContext context, WebSocket webSocket, TaskCompletionSource<object> end)
        {
            Console.WriteLine("new Connection");
            try
            {
                var buffer = new byte[1024 * 4];
                while (true)
                {
                    WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.CloseStatus.HasValue)
                        break;
                    Console.WriteLine(Encoding.UTF8.GetString(new ArraySegment<byte>(buffer, 0, result.Count)));
                    //await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);
                }
            }
            catch (Exception e)
            {

            }
            finally
            {
                Console.WriteLine("closing");
                await webSocket.CloseAsync(WebSocketCloseStatus.Empty, null, CancellationToken.None);
                end.TrySetResult(new object());
            }
        }
        public static async Task<String> ReadString(WebSocket ws)
        {
            ArraySegment<Byte> buffer = new ArraySegment<byte>(new Byte[8192]);

            WebSocketReceiveResult result = null;

            using (var ms = new System.IO.MemoryStream())
            {
                do
                {
                    result = await ws.ReceiveAsync(buffer, CancellationToken.None);
                    ms.Write(buffer.Array, buffer.Offset, result.Count);
                }
                while (!result.EndOfMessage);

                ms.Seek(0, SeekOrigin.Begin);

                using (var reader = new StreamReader(ms, Encoding.UTF8))
                    return reader.ReadToEnd();
            }
        }
    }
}
