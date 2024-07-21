var posX;
var posY;

const styles = ["#FFFFFF", "#000000"];
const N = 10;
const cellSize = 50;
const offsetX = 25;
const offsetY = 25;

function drawFullCanvas() {
    let canvas = document.getElementById("canvas");
    canvas.addEventListener("click", function(ev) {
        posX = ev.clientX;
        posY = ev.clientY;
        console.log("X=" + posX + " Y=" + posY);
    });
    let ctx = canvas.getContext("2d");
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            ctx.beginPath();
            ctx.rect(cellSize * i + offsetX, cellSize * j + offsetY, cellSize, cellSize);
            ctx.fillStyle = styles[0];
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.font = "25px Arial";
            ctx.fillStyle = styles[1];
            ctx.fillText(String(i + j + 1), cellSize * i + cellSize / 2 + offsetX, cellSize * j + cellSize / 2 + 10 + offsetY);
            ctx.textAlign = "center";
            ctx.closePath();
        }
    }
    for (let i = 0; i <= N; i++) {
        ctx.beginPath();
        ctx.strokeStyle = styles[1];
        ctx.moveTo(offsetX, cellSize * i + offsetY);
        ctx.lineTo(cellSize * N + offsetX, cellSize * i + offsetY);
        ctx.stroke();
        ctx.moveTo(cellSize * i + offsetX, offsetY)
        ctx.lineTo(cellSize * i + offsetX, cellSize * N + offsetY);
        ctx.stroke();
        ctx.closePath();
    }
}

drawFullCanvas();