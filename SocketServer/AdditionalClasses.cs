using System;
using System.Net.WebSockets;

namespace SharpChat.SocketServer
{
    class Data
    {
        public string command { get; set; }
        public string data { get; set; }
    }
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

    class Lobby
    {
        public Guid lobbyId { set; get; }
        public UserHandler first { set; get; }
        public UserHandler second { set; get; }
    }
}
