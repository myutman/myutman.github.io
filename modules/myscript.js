var posX;
var posY;

const styles = ["white", "green", "gray"];
const N = 10;
const cellSize = 50;
const offsetX = 25;
const offsetY = 25;

function Coord(x, y) {
    this.x = x;
    this.y = y;
}

function clickHandler(ev) {
    posX = ev.offsetX;
    posY = ev.offsetY;
    if (posX >= offsetX && posX < offsetX + cellSize * N && posY >= offsetY && posY < offsetY + cellSize * N) {
        let X = Math.floor((posX - offsetX) / cellSize);
        let Y = Math.floor((posY - offsetY) / cellSize);
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        if (field[Y][X] == 0) {
            field_color[Y][X] += 1;
            field_color[Y][X] %= 3;
            drawCell(ctx, X, Y);
        } else {
            field_color[Y][X] += 1;
            field_color[Y][X] %= 2;
            drawCell(ctx, X, Y);
        }
        console.log(`X=${X}, Y=${Y}`)
    }
}


function getUTCDate() {
    let date = new Date();
    return date.toUTCString();
}


function putStateToStorage(state) {
    const request = indexedDB.open("MyDB", 3);
    request.onerror = (event) => {
        console.log(event.type)
    };
    request.onsuccess = (event) => {
        const db = event.target.result;
        const objectStore = db.transaction("levels", "readwrite").objectStore("levels");
        objectStore.add(state);
    };
}

var field;
var field_color;

function drawCell(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = styles[field_color[y][x]];
    ctx.strokeStyle = "black";
    ctx.rect(cellSize * x + offsetX, cellSize * y + offsetY, cellSize - 1, cellSize - 1);
    ctx.strokeRect(cellSize * x + offsetX, cellSize * y + offsetY, cellSize - 1, cellSize - 1);
    ctx.fill();
    ctx.closePath();
    let elem = field[y][x];
    if (elem > 0) {
        ctx.beginPath();
        ctx.font = "25px Arial";
        ctx.fillStyle = "black";
        ctx.border
        ctx.fillText(String(elem), cellSize * x + cellSize / 2 + offsetX, cellSize * y + cellSize / 2 + 10 + offsetY);
        ctx.textAlign = "center";
        ctx.closePath();
    }
}


function drawFullCanvas(field) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            drawCell(ctx, j, i)
        }
    }
    canvas.addEventListener("click", clickHandler);
}


var state;

async function loadState(event) {
    const cursor = event.target.result;
    if (cursor) {
        if (state === undefined) {
            state = cursor.value;
            console.log(state);
            cursor.continue();
        } else {
            return;
        }
    }
    if (state === undefined) {
        field = await genField(N);
        putStateToStorage(
            {
                date: getUTCDate(),
                field: field
            }
        );
    } else {
        field = state.field;
    }
    field_color = new Array();
    for (let i = 0; i < N; i++) {
        field_color[i] = new Array();
        for (let j = 0; j < N; j++) {
            field_color[i][j] = 0;
        }
    }
    console.log(field);
    drawFullCanvas(field);
}


async function genField(N) {
    const field = await fetch("https://cave-puzzle-3f21cce9636b.herokuapp.com/gen-cave", {
        method: "GET",
        headers: {
            "Content-type": "applications/json"
        }
    })
        .then((response) => response.json())
    console.log(field)

    return field;
}


function kek() {
    const request = indexedDB.open("MyDB", 3);
    request.onerror = (event) => {
        console.log(event.type)
    };
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        objectStore = db.createObjectStore("levels", { keyPath: "date"});
        objectStore.onerror = (event) => {
            console.log(event.type);
        }
    };


    request.onsuccess = (event) => {
        const db = event.target.result;
        var objectStore;
        
        objectStore = db.transaction("levels", "readwrite").objectStore("levels");
        const openCursor = objectStore.openCursor(null, "prev");
        openCursor.onerror = (event) => {
            console.log(event.type);
        }
        openCursor.onsuccess = loadState;
    };
}

kek();