using System.ComponentModel.DataAnnotations;
using ExerciseASolution;
using Fleck;
using WebSocketBoilerplate;


public class ClientWantsToSendMessageToRoom : BaseDto
{
    public string text { get; set; }
    public string requestId { get; set; }
    public string sender {get;set;}
}




public class ClientWantsToSendMessageToRoomEventHandler(ClientConnectionsState state) : BaseEventHandler<ClientWantsToSendMessageToRoom>
{
    public override Task Handle(ClientWantsToSendMessageToRoom dto, IWebSocketConnection socket)
    {
        throw new ValidationException("You are not authenticated!");
        return Task.CompletedTask;
    }
}