
using System.Text.Json;
using System.Net.WebSockets;
using System.Text;

const int ID_SIZE = 6;
const string DEFAULT_BOARD_STRING = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

var builder = WebApplication.CreateBuilder(args);
var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(7200),
    AllowedOrigins = { "*" }
};
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
var rooms = new Dictionary<string, Room>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseWebSockets(webSocketOptions);
app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.Map("/ws", async context =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        return;
    }

    var roomID = context.Request.Query["id"].ToString();
    if (string.IsNullOrEmpty(roomID))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Bad room id");
        return;
    }

    if (!rooms.ContainsKey(roomID))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Room does not exist");
        return;
    }

    if (rooms[roomID].Sockets.Count >= 2)
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Room is full");
        return;
    }

    var webSocket = await context.WebSockets.AcceptWebSocketAsync();
    rooms[roomID].Sockets.Add(webSocket);

    Console.WriteLine($"Client connected to room {roomID}. Total clients: {rooms[roomID].Sockets.Count}");
    await EchoLoop(webSocket, rooms[roomID]);
});

app.MapPost("/rooms/create", (CreateRoomRequest req) =>
{
    var id = Guid.NewGuid().ToString()[..ID_SIZE];
    var room = new Room(
        ID: id,
        Board: DEFAULT_BOARD_STRING,
        Turn: "white",
        P1Wins: 0,
        P2Wins: 0,
        GamesPlayed: 0,
        BestOf: req.BestOf,
        Sockets: []
    );
    rooms[id] = room;
    Console.WriteLine($"Room created: {id}");
    return new CreateRoomSuccess(
        StatusCode: 200,
        ID: id
    );
})
.WithName("CreateRoom")
.WithOpenApi();

app.Run();

static async Task EchoLoop(WebSocket socket, Room room)
{
    var buffer = new byte[1024 * 4];
    var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    while (!result.CloseStatus.HasValue)
    {
        // send game data to other client
        foreach (WebSocket ws in room.Sockets)
        {
            if (ws != socket && ws.State == WebSocketState.Open)
            {
                await ws.SendAsync(
                    new ArraySegment<byte>(buffer, 0, result.Count),
                    result.MessageType,
                    result.EndOfMessage,
                    CancellationToken.None
                );
            }
        }
        result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    }
    await socket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
    room.Sockets.Remove(socket);
    Console.WriteLine($"Client disconnected from room {room.ID}. Remaining clients: {room.Sockets.Count}");
}

record Room(string ID, string Board, string Turn, int P1Wins, int P2Wins, int GamesPlayed, int BestOf, List<WebSocket> Sockets);
record CreateRoomRequest(int BestOf);
record CreateRoomSuccess(int StatusCode, string ID);

