using System.Reflection;
using ExerciseASolution;
using ExerciseCSolution;
using Fleck;
using WebSocketBoilerplate;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptionsWithValidateOnStart<AppOptions>()
    .Bind(builder.Configuration.GetSection(nameof(AppOptions)));

builder.Services.AddSingleton<ClientConnectionsState>();
builder.Services.AddSingleton<SecurityService>();

builder.Services.InjectEventHandlers(Assembly.GetExecutingAssembly());

var app = builder.Build();

var logger = app.Services.GetRequiredService<ILogger<Program>>();

var server = new WebSocketServer("ws://0.0.0.0:8181");

var clientConnections = app.Services.GetRequiredService<ClientConnectionsState>().ClientConnections;
server.Start(socket =>
{
    socket.OnOpen = () => clientConnections.Add(socket);
    socket.OnClose = () => clientConnections.Remove(socket);
    socket.OnMessage = message =>
    {
        Task.Run(async () =>
        {
            try
            {
                await app.CallEventHandler(socket, message);
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error handling message: {Error}", e.Message);
                socket.SendDto(new ServerSendsErrorMessageDto { Error = e.Message });
            }
        });
    };
});


app.Run();

public class ServerSendsErrorMessageDto : BaseDto
{
    public string Error { get; set; }
}