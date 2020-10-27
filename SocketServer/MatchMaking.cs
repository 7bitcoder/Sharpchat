using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SharpChat.SocketServer
{
    class MatchMaking
    {
        internal static Dictionary<Guid, Lobby> lobbys = new Dictionary<Guid, Lobby>();
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
                    lobbys.Add(lobby.lobbyId, lobby);
                    var msg = new Data { command = "strangerFound", data = JsonConvert.SerializeObject(new { lobbyId = lobby.lobbyId.ToString(), sex = uh2.user.preferences.user.sex, age = uh2.user.preferences.user.age }) };
                    uh1.sendData(msg);
                    var msg2 = new Data { command = "strangerFound", data = JsonConvert.SerializeObject(new { lobbyId = lobby.lobbyId.ToString(), sex = uh1.user.preferences.user.sex, age = uh1.user.preferences.user.age }) };
                    uh2.sendData(msg2);
                }
                return true;
            });
        }
        public static void add(UserHandler uh)
        {
            queue.Add(uh);
        }
    }
}
