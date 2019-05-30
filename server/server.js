const WIDTH = 8;
const HEIGHT = 7;
const DURATION = 6000;

const http = require("http");
let io;
let server;
let users = [];
const grid = [];

const startBeat = function(duration){
    io.emit("startBeat");
    setTimeout(startBeat, duration, duration);
};

const setup = function() {
    //initializes the grid to be all false
    for(let i = 0; i < WIDTH; i++) {
        grid.push(Array(HEIGHT).fill(false));
    }

    //starts the server, gets the port from heroku if possible
    server = http.createServer(function(request, response) {
        response.end("");
    });
    server.listen(process.env.PORT || 8080);

    //setup event handlers
    io = require("socket.io")(server);
    io.on("connection", function(socket) {

        //register users and send state on connect
        users.push(socket);
        //socket.emit("setup", grid);

        //deregister users on disconnect
        socket.on("disconnect", function() {
            const index = users.indexOf(socket);
            if(index < 0) {
                console.log("missing user!");
            } else {
                users = users.splice(index, 1);
            }
        });

        //set true and broadcast on activation
        socket.on("activate", function(cell) {
            grid[cell[0]][cell[1]] = true;
            socket.broadcast.emit("activate", cell);
        });

        //set false and broadcast on deactivation
        socket.on("deactivate", function(cell) {
            grid[cell[0]][cell[1]] = false;
            socket.broadcast.emit("deactivate", cell);
        });
    });

    startBeat(DURATION);
};
setup();