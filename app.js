
const express = require("express")
const http = require("http")
const socket = require("socket.io")
const { Chess } = require("chess.js")
const path = require("path");
const app = express()
const server = http.createServer(app)
const io = socket(server)

const chess = new Chess()
let players = {}
let currentPlayer = "W"

app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" })
})

io.on("connection", function (uniqueSocket) {
    console.log("connected")

    if (!players.white) {
        players.white = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "w");

    } else if (!players.black) {
        players.black = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "b");

    } else {
        uniqueSocket.emit("spectatorRole");
    }

    uniqueSocket.on("disconnected", function () {
        if (uniqueSocket.id === players.white) {
            delete players.white;
        }
        else if (uniqueSocket.id === players.black) {
            delete players.black
        }
    })

    uniqueSocket.on("move", (move) => {
        try {
            if (chess.turn() === 'w' && uniqueSocket.id !== players.white) return;
            if (chess.turn() === 'b' && uniqueSocket.id !== players.black) return;

            const result = chess.move(move);
            if (result){
                currentPlayer = chess.turn();
                io.emit("move",move);
                io.emit("boardState", chess.fen())
            }else{
                console.log('invalid move : ', move);
                uniqueSocket.emit( "Invalid Move",move)
                
            }


        } catch (error) {
            console.log(error);
            uniqueSocket.emit("invalid move : ", move)

        }
    })

})

server.listen(3000, function () {
    console.log("server is running on port 3000")
})