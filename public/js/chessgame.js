const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard")

let draggedPeice = null
let sourceSquare = null
let playerRole = null

const renderBoard = ()=>{
    const board = chess.board();
    boardElement.innerHTML = ""
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex)=>{
            const squareElement = document.createElement("div")
            squareElement.classList.add("square",
                (rowindex+squareindex)%2===0?"light":"dark"
            )
            squareElement.dataset.row = rowindex
            squareElement.dataset.col = squareindex
            
            if(square){
                const peiceElement = document.createElement("div")
                peiceElement.classList.add("peice", 
                    square.color==="w"?"white":"black"
                )
                peiceElement.innerText = getPeiceUnicode(square);
                peiceElement.draggable = playerRole===square.color

                peiceElement.addEventListener('dragstart', (e)=>{
                    if(peiceElement.draggable){
                        draggedPeice = peiceElement;
                        sourceSquare = {row: rowindex, col: squareindex}
                        e.dataTransfer.setData("text/plain", "")
                    }
                })
                peiceElement.addEventListener("dragend", (e)=>{
                    draggedPeice = null;
                    sourceSquare = null;
                })
                squareElement.appendChild(peiceElement)
            }

            squareElement.addEventListener('dragover', (e)=>{
                e.preventDefault();
            })

            squareElement.addEventListener('drop', (e)=>{
                e.preventDefault();
                if(draggedPeice){
                    const targetSource = {
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col),
                    }
                    handleMove(sourceSquare, targetSource)
                }
            })    
            boardElement.appendChild(squareElement)
        })    
        
    }); 
    
}
const handleMove = (source, target)=>{
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}` ,
        promotion: "q",
    }
    socket.emit("move", move)
}


const getPeiceUnicode = (peice)=>{
    const unicodePeice = {
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♟",
        R:"♜",
        N:"♞",
        B:"♝",
        Q:"♛",
        K:"♚",
    }    
    return unicodePeice[peice.type] || ""
}

socket.on("playerRole", function(role){
    playerRole = role
    renderBoard();
})

socket.on("spectatorRole", function(){
    playerRole = null
    renderBoard()
})

socket.on("boardState", function(fen){
    chess.move(fen)
    renderBoard()
})

socket.on("move", function(move){
    chess.move(move)
    renderBoard()

})

renderBoard()