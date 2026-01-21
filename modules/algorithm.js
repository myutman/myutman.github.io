// Direction vectors
const dis = [0, 1, 0, -1];
const djs = [1, 0, -1, 0];

const d1is = [0, 1, 1, 1, 0, -1, -1, -1];
const d1js = [1, 1, 0, -1, -1, -1, 0, 1];

// Helper function to check if a cell can be occupied
function check(cave, i, j) {
    const neighbours = [];
    for (let idx = 0; idx < d1is.length; idx++) {
        const di = d1is[idx];
        const dj = d1js[idx];
        if (i + di >= 0 && i + di < cave.length && j + dj >= 0 && j + dj < cave[0].length) {
            neighbours.push(cave[i + di][j + dj]);
        }
    }

    let was_occupied = false;
    let cnt_empty_before_first = 0;
    let cnt_empty = 0;
    let cnt_empty_in_between = 0;
    let cnt_in_between = 0;
    
    for (const neighbour of neighbours) {
        if (neighbour === '.') {
            if (!was_occupied) {
                cnt_empty_before_first += 1;
            } else {
                cnt_empty += 1;
            }
        } else {
            was_occupied = true;
            cnt_empty_in_between += cnt_empty;
            if (cnt_empty >= 1) {
                cnt_in_between += 1;
            }
            cnt_empty = 0;
        }
    }
    
    return ((cnt_empty + cnt_empty_before_first === 0) || (cnt_empty_in_between === 0)) && (cnt_in_between <= 1);
}

// Add a random candidate to the cave
function addRandomCandidate(cave, candidates) {
    const candidatesArray = Array.from(candidates);
    const randomIndex = Math.floor(Math.random() * candidatesArray.length);
    const [i, j] = candidatesArray[randomIndex].split(',').map(Number);

    if (check(cave, i, j)) {
        cave[i][j] = '#';
        for (let idx = 0; idx < dis.length; idx++) {
            const di = dis[idx];
            const dj = djs[idx];
            if (i + di >= 0 && i + di < cave.length && j + dj >= 0 && j + dj < cave[0].length && cave[i + di][j + dj] === '.') {
                candidates.add(`${i + di},${j + dj}`);
            }
        }
    }
    candidates.delete(`${i},${j}`);
    return candidates;
}

// FoldMap function (similar to Python's foldMap)
function* foldMap(fn, iterable, initial) {
    let state = initial;
    for (const item of iterable) {
        const [newState, newItem] = fn(state, item);
        state = newState;
        yield newItem;
    }
}

// Duplet helper
function duplet(x) {
    return [x, x];
}

// CaveHelper function
function caveHelper(op) {
    return (s, x) => {
        if (x === null || x === undefined) {
            return [null, null];
        }
        return duplet(s === null || s === undefined ? x : op(s, x));
    };
}

// Transpose a 2D array
function transpose(cave) {
    const result = [];
    for (let j = 0; j < cave[0].length; j++) {
        const column = [];
        for (let i = 0; i < cave.length; i++) {
            column.push(cave[i][j]);
        }
        result.push(column);
    }
    return result;
}

// Calculate cumulative values in all directions
function calcCum(cave, op) {
    const opLeft = cave.map(row => Array.from(foldMap(caveHelper(op), row, null)));
    const opRight = cave.map(row => Array.from(foldMap(caveHelper(op), [...row].reverse(), null)).reverse());
    
    const transposed = transpose(cave);
    const opUpTransposed = transposed.map(column => Array.from(foldMap(caveHelper(op), column, null)));
    const opUp = transpose(opUpTransposed);
    
    const opDownTransposed = transposed.map(column => Array.from(foldMap(caveHelper(op), [...column].reverse(), null)).reverse());
    const opDown = transpose(opDownTransposed);
    
    // Helper to safely combine values, returning null if any is null
    const safeOp = (a, b) => {
        if (a === null || a === undefined || b === null || b === undefined) {
            return null;
        }
        return op(a, b);
    };
    
    const result = [];
    for (let i = 0; i < cave.length; i++) {
        const row = [];
        for (let j = 0; j < cave[i].length; j++) {
            const item = opLeft[i][j];
            if (item === null || item === undefined) {
                row.push(null);
            } else {
                // Match Python: op(op(op_left, op_right), op(op_up, op_down))
                const combined = safeOp(
                    safeOp(opLeft[i][j], opRight[i][j]),
                    safeOp(opUp[i][j], opDown[i][j])
                );
                row.push(combined);
            }
        }
        result.push(row);
    }
    return result;
}

// Calculate seen values
function calcSeen(cave) {
    const transformedCave = cave.map(row =>
        row.map(item => item === '.' ? 1 : null)
    );
    
    const cumResult = calcCum(transformedCave, (a, b) => {
        if (a === null || a === undefined) return b;
        if (b === null || b === undefined) return a;
        return a + b;
    });
    
    return cumResult.map(row =>
        row.map(item => item === null || item === undefined ? null : item - 3)
    );
}

// Min cell helper for mapping
function minCell(cell1, cell2) {
    if (cell1 === null || cell1 === undefined) return cell2;
    if (cell2 === null || cell2 === undefined) return cell1;
    if (cell1[0] < cell2[0]) {
        return cell1;
    }
    return cell2;
}

// Make mapping from seen values
function makeMapping(seen) {
    const transformedSeen = seen.map((row, i) =>
        row.map((item, j) =>
            item === null || item === undefined ? null : [item, [i, j]]
        )
    );
    
    const minimum = calcCum(transformedSeen, minCell);
    
    const mapping = new Set();
    for (const row of minimum) {
        for (const item of row) {
            if (item !== null && item !== undefined) {
                const key = `${item[1][0]},${item[1][1]}`;
                mapping.add(key);
            }
        }
    }
    
    return mapping;
}

// Generate puzzle field
export function genField(N) {
    // Create cave with walls around
    const cave = [
        Array(N + 2).fill('#'),
        ...Array(N).fill(null).map(() => ['#', ...Array(N).fill('.'), '#']),
        Array(N + 2).fill('#')
    ];
    
    // Initialize candidates set
    var candidates = new Set();
    for (let i = 1; i < N; i++) {
        candidates.add(`1,${i}`);
    }
    for (let i = 1; i < N; i++) {
        candidates.add(`${i},${N}`);
    }
    for (let i = 2; i < N + 1; i++) {
        candidates.add(`${N},${i}`);
    }
    for (let i = 2; i < N + 1; i++) {
        candidates.add(`${i},1`);
    }

    console.log("Cave: ", cave);
    console.log("Candidates: ", candidates);
    
    // Calculate number of occupied cells
    const nOccupied = Math.floor(Math.random() * (Math.floor(0.75 * N * N) - Math.floor(0.5 * N * N) + 1)) + Math.floor(0.5 * N * N);
    
    // Add random candidates
    for (let i = 0; i < nOccupied; i++) {
        if (candidates.size === 0) break;
        candidates = addRandomCandidate(cave, candidates);
    }
    
    // Calculate seen values
    const seen = calcSeen(cave);
    
    // Create mapping
    const mapping = makeMapping(seen);
    
    // Create puzzle field
    const puzzle = Array(N).fill(null).map(() => Array(N).fill(0));
    
    for (const key of mapping) {
        const [i, j] = key.split(',').map(Number);
        puzzle[i - 1][j - 1] = seen[i][j];
    }
    
    return puzzle;
}

// BFS for connectivity checking
function bfs(si, sj, cave, used) {
    const q = [[si, sj]];
    used[si][sj] = true;
    
    while (q.length > 0) {
        const [i, j] = q.shift();
        
        for (let idx = 0; idx < dis.length; idx++) {
            const di = dis[idx];
            const dj = djs[idx];
            const i1 = i + di;
            const j1 = j + dj;
            
            if (i1 >= 0 && i1 < used.length && j1 >= 0 && j1 < used[0].length &&
                cave[i][j] === cave[i1][j1] && !used[i1][j1]) {
                q.push([i1, j1]);
                used[i1][j1] = true;
            }
        }
    }
}

// Check occupied connectivity
function checkOccupiedConnectivity(occupied) {
    const N = occupied.length;
    const cave = [
        Array(N + 2).fill(true),
        ...occupied.map(row => [true, ...row.map(item => item === 2), true]),
        Array(N + 2).fill(true)
    ];
    
    const used = cave.map(row => Array(row.length).fill(false));
    
    bfs(0, 0, cave, used);
    
    for (let i = 0; i < cave.length; i++) {
        for (let j = 0; j < cave[i].length; j++) {
            if (cave[i][j] && !used[i][j]) {
                return false;
            }
        }
    }
    
    return true;
}

// Check free connectivity
function checkFreeConnectivity(cave) {
    const used = cave.map(row => Array(row.length).fill(false));
    let si = null;
    let sj = null;
    
    for (let i = 0; i < cave.length; i++) {
        for (let j = 0; j < cave[i].length; j++) {
            if (!cave[i][j]) {
                si = i;
                sj = j;
                break;
            }
        }
        if (si !== null) break;
    }
    
    if (si === null || sj === null) {
        return true; // No free cells
    }
    
    bfs(si, sj, cave, used);
    
    for (let i = 0; i < cave.length; i++) {
        for (let j = 0; j < cave[i].length; j++) {
            if (!cave[i][j] && !used[i][j]) {
                return false;
            }
        }
    }
    
    return true;
}

// Check numbers match
function checkNumbers(field, occupied) {
    const transformedOccupied = occupied.map(row =>
        row.map(item => item === 2 ? '#' : '.')
    );
    
    const seen = calcSeen(transformedOccupied);
    
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            const fieldItem = field[i][j];
            const seenItem = seen[i][j];
            if (fieldItem !== 0 && (seenItem === null || seenItem === undefined || fieldItem !== seenItem)) {
                return false;
            }
        }
    }
    
    return true;
}

// Check if the puzzle is solved
export function checkSolved(field, field_colors) {
    const cave = field_colors.map(row =>
        row.map(item => item === 2)
    );
    
    if (!checkOccupiedConnectivity(field_colors)) {
        return false;
    }
    
    if (!checkFreeConnectivity(cave)) {
        return false;
    }
    
    if (!checkNumbers(field, field_colors)) {
        return false;
    }
    
    return true;
}
