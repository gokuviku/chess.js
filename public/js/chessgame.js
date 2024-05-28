
const socket = io()
const chess = new Chess()

const boardElement = document.querySelector(".chessboard")

let draggedPiece = null
let sourceSquare = null;
let playerRole = null;


const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowin) => {
        row.forEach((sqaure, colin) => {
            const sqaureElement = document.createElement("div")
            sqaureElement.classList.add("sqaure",
                (rowin + colin) % 2 === 0 ? "light" : "dark"
            )

            sqaureElement.dataset.row = rowin
            sqaureElement.dataset.col = colin

            if (sqaure) {
                const pieceElement = document.createElement("div")
                pieceElement.classList.add("piece", sqaure.color === 'w' ? "white" : "black")
                pieceElement.innerText = getPieceUniCode(sqaure);
                pieceElement.draggable = playerRole === sqaure.color

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement
                        sourceSquare = { row: rowin, col: colin }
                        e.dataTransfer.setData("text/plain", "");
                    }
                })

                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null
                    sourceSquare = null
                })


                sqaureElement.appendChild(pieceElement)
            }

            sqaureElement.addEventListener("dragover", function (e) {
                e.preventDefault()
            })

            sqaureElement.addEventListener("drop", function (e) {
                e.preventDefault()
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(this.dataset.row),
                        col: parseInt(this.dataset.col)
                    }
                    handleMove(sourceSquare, targetSource)
                }
            })
            boardElement.appendChild(sqaureElement)

        })
    })

}

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + source.col)}${8 - source.row}` ,
        promotion: 'q',

    }
    socket.emit("move",move)
}

const getPieceUniCode = (piece) => {
    const unicodePieces = {
        p: "♟",  // black pawn
        r: "♜",  // black rook
        n: "♞",  // black knight
        b: "♝",  // black bishop
        q: "♛",  // black queen
        k: "♚",  // black king
        P: "♙",  // white pawn
        R: "♖",  // white rook
        N: "♘",  // white knight
        B: "♗",  // white bishop
        Q: "♕",  // white queen
        K: "♔"   // white king
    };
    return unicodeMap[piece] || "";
}

socket.on("playerRole",function(role){
    playerRole=role
    renderBoard()

})

socket.on("spectatorRole", function () {
    playerRole = null
    renderBoard()

})

socket.on("boardState", function (fen) {
    chess.load(fen)
    renderBoard()

})

socket.on("move", function (move) {
    chess.move(move)
    renderBoard()

})

renderBoard()
