using System.Reflection;
using ExerciseASolution;
using Fleck;
using WebSocketBoilerplate;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ClientConnectionsState>();

builder.Services.InjectEventHandlers(Assembly.GetExecutingAssembly());

var app = builder.Build();

var server = new WebSocketServer("ws://0.0.0.0:8181");

var clientConnections = app.Services.GetRequiredService<ClientConnectionsState>().ClientConnections;
server.Start(socket =>
{
    socket.OnOpen = () => clientConnections.Add(socket);
    socket.OnClose = () => clientConnections.Remove(socket);
    try
    {
        socket.OnMessage = async message => await app.CallEventHandler(socket, message);
    }
    catch (Exception e)
    {
        Console.WriteLine(e.Message);
        Console.WriteLine(e.InnerException);
        Console.WriteLine(e.StackTrace);
    }
    
});


app.Run();
