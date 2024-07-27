var posX;
var posY;

const styles = ["#FFFFFF", "#000000"];
const N = 10;
const cellSize = 50;
const offsetX = 25;
const offsetY = 25;

function Coord(x, y) {
    this.x = x;
    this.y = y;
}

function randomArrayValue(array) {
    let index = Math.floor(Math.random() * array.length);
    return array[index];
}

const array = [1, 2, 3, 4, 5];


function clickHandler(ev) {
    posX = ev.clientX;
    posY = ev.clientY;
    console.log("X=" + posX + " Y=" + posY + " rand=" + randomArrayValue(array));
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


function drawFullCanvas(field) {
    let canvas = document.getElementById("canvas");
    canvas.addEventListener("click", clickHandler);
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
            ctx.fillText(String(field[i][j]), cellSize * i + cellSize / 2 + offsetX, cellSize * j + cellSize / 2 + 10 + offsetY);
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

var state;
function loadState(event) {
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
    var field;
    if (state === undefined) {
        field = genField(N);
    } else {
        field = state.field;
        putStateToStorage(
            {
                date: getUTCDate(),
                field: field
            }
        );
    }
    console.log(field);
    drawFullCanvas(field);
}


const manhattan_delta = [
    new Coord(1, 0),
    new Coord(0, -1), 
    new Coord(-1, 0),
    new Coord(0, 1)
];

const king_delta_x = [0, 1, 1, 1, 0, -1, -1, -1];
const king_delta_y = [1, 1, 0, -1, -1, -1, 0, 1];

function check(cave, x, y) {
    let neighbours = new Array();
    for (let d = 0; d < king_delta_x.length; d++) {
        let dx = king_delta_x[d];
        let dy = king_delta_y[d];
        neighbours.push(cave[y + dy][x + dx]);
    }

    let was_occupied = false
    let cnt_empty_before_first = 0
    let cnt_empty = 0
    let cnt_empty_in_between = 0
    let cnt_in_between = 0
    neighbours.forEach((neighbour) => {
        if (neighbour == 0) {
            if (!was_occupied) {
                cnt_empty_before_first++;
            } else {
                cnt_empty++;
            }
        } else {
            was_occupied = true;
            cnt_empty_in_between += cnt_empty;
            if (cnt_empty >= 1) {
                cnt_in_between += 1;
            }
            cnt_empty = 0;
        }
    });

    return ((cnt_empty + cnt_empty_before_first == 0) || (cnt_empty_in_between == 0)) && (cnt_in_between <= 1);
}

function add_random_candidate(cave, candidates) {
    console.log(cave);
    console.log(candidates);
    let coord = randomArrayValue(candidates);
    if (check(cave, coord.x, coord.y)) {
        cave[coord.x][coord.y] = 1;
        console.log(manhattan_delta);
        manhattan_delta.forEach((coord_delta, _1, _2) => {
            console.log(coord_delta);
            let new_coord = new Coord(coord.y + coord_delta.y, coord.x + coord_delta.y);
            console.log(new_coord);

            if (cave[new_coord.y][new_coord.x] == 0 && candidates.indexOf(new_coord) != -1) {
                candidates.push(new_coord);
            }
        });
    }
    candidates.splice(candidates.indexOf(coord), 1);
}


function gen_puzzle(N) {
    var cave = new Array();
    var candidates = new Array();

    for (let y = 0; y < N + 2; y++) {
        var cave_row = new Array();
        for (let x = 0; x < N + 2; x++) {
            if (y == 0 || y == N + 1 || x == 0 || x == N + 1) {
                cave_row.push(1);
            } else {
                cave_row.push(0);
            }
        }
        cave.push(cave_row);
    }

    for (let y = 1; y <= N; y++) {
        candidates.push(new Coord(y, 0));
        candidates.push(new Coord(0, y));
    }

    for (let y = 2; y < N; y++) {
        candidates.push(new Coord(y, N));
        candidates.push(new Coord(N, y));
    }


    let n_occupied = Math.round((0.5 + Math.random() * 0.25) * N**2);

    for (let i = 0; i < n_occupied; i++) {
        add_random_candidate(cave, candidates);
    }

    // for row in cave:
    //     print(''.join(row))


    // seen = calc_seen(cave)

    // mapping = make_mapping(seen)

    // puzzle = [[0] * N for _ in range(N)]

    // for i, j in mapping:
    //     puzzle[i - 1][j - 1] = seen[i][j]

    // for row in puzzle:
    //     print('\t'.join(map(str, row)))
    
    return cave;
}


function genField(N) {
    // var field = new Array();
    // for (let i = 0; i < N; i++) {
    //     var fieldRow = new Array();
    //     for (let j = 0; j < N; j++) {
    //         fieldRow.push(randomArrayValue(array));
    //     }
    //     field.push(fieldRow);
    // }
    // return field;
    return gen_puzzle(N);
}

async function kek() {
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