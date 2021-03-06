var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var port = process.env.PORT || 6969;

//Array to store rooms
var rooms_nr_client = [];

//Setup socket server
var io = require('socket.io')(http);
io.on('connection', function (socket) {
    //Call when the client call socket.emit('room_create', _);
    socket.on('room_create', function (room) {
        console.log("Room " + room +" created");
        result = socket.join(room);
        rooms_nr_client.push(room);
        socket.emit('created', room);
    });
    //Call when the client call socket.emit('room_join', _);
    socket.on('room_join', function (room) {
        //Variable to check
        var have_room = false;
        //Check if there is a room with the given id
        for (let index = 0; index < rooms_nr_client.length; index++) {
            if (room == rooms_nr_client[index]) {
                have_room = true;
                break;
            }
        }
        //If there is a room join it, if not tell the client there is not
        if (have_room) {
            console.log("New connection at room " + room);
            socket.join(room);
            socket.emit('joined',room);
        } else {
            socket.emit('join_failed',room);
        }
    });
    //Call when the client call socket.emit('move', _ );
    socket.on('move', function (data) {
        var room = data.room;
        var move = data.move;
        socket.in(room).emit('move', move);
    });
});

//Define the default route
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/chess_game_page.html');
});

//Listen to the given port
http.listen(port, function () {
    console.log("Listening on * " + port);
});