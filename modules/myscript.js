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

function getUTCDateMilliseconds() {
    let date = new Date();
    return date.toISOString();
}

function getUTCDate() {
    let date = new Date();
    return date.toLocaleDateString("en-US")
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
        putEventToStorage(
            {
                x: X,
                y: Y,
                date: getUTCDateMilliseconds()
            }
        )
        console.log(`X=${X}, Y=${Y}`)
    }
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

function putEventToStorage(click_event) {
    const request = indexedDB.open("MyDB", 3);
    request.onerror = (event) => {
        console.log(event.type)
    };
    request.onsuccess = (event) => {
        const db = event.target.result;
        const objectStore = db.transaction("events", "readwrite").objectStore("events");
        objectStore.add(click_event);
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


function drawFullCanvas() {
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


function upgradeDB(event) {
    const db = event.target.result;

    objectStore = db.createObjectStore("levels", { keyPath: "date" });
    objectStore.onerror = (event) => {
        console.log(event.type);
    }

    objectStore1 = db.createObjectStore("events", { keyPath: "date" });
    objectStore1.onerror = (event) => {
        console.log(event.type);
    } 
}

var events_loaded;

const delay = ms => new Promise(res => setTimeout(res, ms));

var events = new Array();

async function loadEvents(event) {
    const cursor = event.target.result;
    if (cursor) {
        click_event = cursor.value;
        if (click_event === undefined) {
            return;
        }
        console.log(click_event);

        events.push(click_event);

        cursor.continue();
        return;
    } else {
        console.log("Events loaded");
    }

    if (events.length > 0) {
        while (field_set === undefined) {
            await delay(1);
        }
        console.log("After while");

        for (let i = 0; i < events.length; i++) {
            let click_event = events[i];
            if (field[click_event.y][click_event.x] > 0) {
                field_color[click_event.y][click_event.x] += 1;
                field_color[click_event.y][click_event.x] %= 2;
            } else {
                field_color[click_event.y][click_event.x] += 1;
                field_color[click_event.y][click_event.x] %= 3;
            }
        }
    }
    events_loaded = true;
    console.log("All events been handled");
}

var field_set;

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
    if (state === undefined || state.date != getUTCDate()) {
        console.log("Getting field");
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
    field_set = true;
    console.log(field);
    while (events_loaded === undefined) {
        await delay(1);
    }
    drawFullCanvas();
}

const BACKEND_URL = "http://backend.com:5432";
// const BACKEND_URL = "https://cave-puzzle-3f21cce9636b.herokuapp.com";

async function genField(N) {
    const field = await fetch(BACKEND_URL + `/gen-cave?field_size=${N}`, {
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
    let canvas_height = N * cellSize + 2 * offsetY;
    let canvas_width = N * cellSize + 2 * offsetX;
    let canvas_placement = document.getElementById("canvas_placement");
    let canvas = document.createElement("canvas");
    canvas.height = `${canvas_height}`;
    canvas.width = `${canvas_width}`;
    canvas.id = "canvas";
    canvas_placement.appendChild(canvas);

    console.log(state);

    const request = indexedDB.open("MyDB", 3);
    request.onerror = (event) => {
        console.log(event.type)
    };
    request.onupgradeneeded = upgradeDB

    request.onsuccess = (event) => {
        const db = event.target.result;
        var objectStore;
        
        objectStore = db.transaction("levels", "readwrite").objectStore("levels");
        const openCursor = objectStore.openCursor(null, "prev");
        openCursor.onerror = (event) => {
            console.log(event.type);
        }
        openCursor.onsuccess = loadState;

        var objectStore1 = db.transaction("events", "readwrite").objectStore("events");
        const openCursor1 = objectStore1.openCursor(null, "prev");
        openCursor1.onerror = (event) => {
            console.log(event.type);
        }
        openCursor1.onsuccess = loadEvents;
    };
}

kek();