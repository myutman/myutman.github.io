from collections import deque

from .cave_gen import calc_seen

dis = [0, 1, 0, -1]
djs = [1, 0, -1, 0]

def bfs(si, sj, cave, used):
    q = deque()
    used[si][sj] = True
    q.append((si, sj))

    while len(q) > 0:
        i, j = q.popleft()

        for di, dj in zip(dis, djs):
            i1 = i + di
            j1 = j + dj
            if (0 <= i1 < len(used)) and (0 <= j1 < len(used)) and (cave[i][j] == cave[i1][j1]) and not used[i1][j1]:
                q.append((i1, j1))
                used[i1][j1] = True


def check_occupied_connectivity(occupied):
    cave = [[True] * (len(occupied) + 2)] + [
        [True] + row + [True]
        for row in occupied
    ] + [[True] * (len(occupied) + 2)]

    used = [[False] * len(row) for row in cave]

    bfs(0, 0, cave, used)
    for row, row_used in zip(cave, used):
        for item, item_used in zip(row, row_used):
            if item and not item_used:
                return False
    return True


def check_free_connectivity(cave):
    used = [[False] * len(row) for row in cave]
    si, sj = None, None
    for i, row in enumerate(cave):
        for j, item in enumerate(row):
            if not cave[i][j]:
                si, sj = i, j
                break
        if si is not None:
            break

    bfs(si, sj, cave, used)

    for row, row_used in zip(cave, used):
        for item, item_used in zip(row, row_used):
            if not item and not item_used:
                return False

    return True


def check_numbers(field, occupied):
    transformed_occupied = [
        ['#' if item == 2 else '.' for item in row]
        for row in occupied
    ]
    seen = calc_seen(transformed_occupied)
    for row, row_seen in zip(field, seen):
        for item, item_seen in zip(row, row_seen):
            if item != 0 and (item_seen is None or item != item_seen):
                return False
    return True


def check_solved(field, occupied):
    cave = [
        [item == 2 for item in row]
        for row in occupied
    ]

    print("Check 1")
    if not check_occupied_connectivity(cave):
        return False

    print("Check 2")    
    if not check_free_connectivity(cave):
        return False
    
    print("Check 3")
    if not check_numbers(field, occupied):
        return False
    
    print("Passed")
    return True