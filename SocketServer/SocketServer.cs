using System;
using System.Net.WebSockets;
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

        public async void handleUser(WebSocket webSocket, TaskCompletionSource<object> end)
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


}
