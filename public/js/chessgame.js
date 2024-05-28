const socket = io()
const chess = new Chess()

const boardElement = document.querySelector(".chessboard")

socket.emit("some")

socket.on("something",function(){
    console.log('something recieved');
    
})

