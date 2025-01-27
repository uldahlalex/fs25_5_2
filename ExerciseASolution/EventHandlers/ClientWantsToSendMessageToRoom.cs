using ExerciseASolution;
using Fleck;
using WebSocketBoilerplate;


public class ClientWantsToSendMessageToRoom : BaseDto
{
    public string text { get; set; }
    public string requestId { get; set; }
    public string sender {get;set;}
}



public class ServerConfirmsMessageSent : BaseDto
{
    public string messageId { get; set; }
    
    public string requestId { get; set; }
    public string sender { get; set; }
    public int timestamp { get; set; }
}
public class ServerSendsMessageToRoom : BaseDto
{
    public string messageId { get; set; }
    public string sender { get; set; }
    public int timestamp { get; set; }
    public string text { get; set; }
}




public class ClientWantsToSendMessageToRoomEventHandler(ClientConnectionsState state) : BaseEventHandler<ClientWantsToSendMessageToRoom>
{
    public override Task Handle(ClientWantsToSendMessageToRoom dto, IWebSocketConnection socket)
    {
        var messageId = Guid.NewGuid().ToString();
        socket.SendDto(new ServerConfirmsMessageSent()
        {
            sender = dto.sender,
            messageId = messageId,
            timestamp  = (int)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds,
            requestId = dto.requestId
        });
        foreach (var stateClientConnection in state.ClientConnections)
        {
            stateClientConnection.SendDto(new ServerSendsMessageToRoom()
            {
                messageId = Guid.NewGuid().ToString(),
                sender = dto.sender,
                timestamp  = (int)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds,
                text = dto.text,
            });
        }
        return Task.CompletedTask;
    }
}