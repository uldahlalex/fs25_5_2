using Fleck;

namespace ExerciseASolution;

public class ClientConnectionsState
{
    public List<IWebSocketConnection> ClientConnections { get; set; } = new List<IWebSocketConnection>() { };
}