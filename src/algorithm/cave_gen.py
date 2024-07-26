import random
from copy import copy

from functools import reduce


dis = [0, 1, 0, -1]
djs = [1, 0, -1, 0]

d1is = [0, 1, 1, 1, 0, -1, -1, -1]
d1js = [1, 1, 0, -1, -1, -1, 0, 1]


def check(cave, i, j):
    neighbours = []
    for di, dj in zip(d1is, d1js):
        neighbours.append(cave[i + di][j + dj])

    was_occupied = False    
    cnt_empty_before_first = 0
    cnt_empty = 0
    cnt_empty_in_between = 0
    cnt_in_between = 0
    for neighbour in neighbours:
        if neighbour == '.':
            if not was_occupied:
                cnt_empty_before_first += 1
            else:
                cnt_empty += 1
        else:
            was_occupied = True
            cnt_empty_in_between += cnt_empty
            if cnt_empty >= 1:
                cnt_in_between += 1
            cnt_empty = 0
    
    return ((cnt_empty + cnt_empty_before_first == 0) or (cnt_empty_in_between == 0)) and (cnt_in_between <= 1)


def add_random_candidate(cave, candidates: set):
    i, j = random.choice(list(candidates))
    if check(cave, i, j):
        cave[i][j] = '#'
        for di, dj in zip(dis, djs):
            if cave[i + di][j + dj] == '.':
                candidates.add((i + di, j + dj))
    candidates.remove((i, j))


def foldMap(function, iterable, initial):
    state = initial
    for item in iterable:
        state, new_item = function(state, item)
        yield new_item


def duplet(x):
    return x, x


def caveHelper(op):
    return lambda s, x: (None, None) if x is None else duplet(x if s is None else op(s, x))


def transpose(cave):
    return [[*column] for column in zip(*cave)]


def calc_cum(cave, op):
    op_left = [[*foldMap(caveHelper(op), row, None)] for row in cave]
    op_right = [[*foldMap(caveHelper(op), row[::-1], None)][::-1] for row in cave]

    op_up = transpose([[*foldMap(caveHelper(op), column, None)] for column in transpose(cave)])
    op_down = transpose([[*foldMap(caveHelper(op), column[::-1], None)][::-1] for column in transpose(cave)])

    return [[None if item is None else op(op(op_left[i][j], op_right[i][j]), op(op_up[i][j], op_down[i][j])) for j, item in enumerate(row)]
        for i, row in enumerate(cave)
    ]


def calc_seen(cave):
    # N = len(cave)
    # seen = [[0] * N for _ in range(N)]
    # seen_left = [[0] * N for _ in range(N)]
    # seen_right = [[0] * N for _ in range(N)]
    # seen_up = [[0] * N for _ in range(N)]
    # seen_down = [[0] * N for _ in range(N)]

    # for i in range(1, N - 1):
    #     for j in range(1, N - 1):
    #         if cave[i][j] == '.':
    #             seen_left[i][j] = seen_left[i][j - 1] + 1
    #             seen_up[i][j] = seen_up[i - 1][j] + 1

    # for i in range(N - 2, 0, -1):
    #     for j in range(N - 2, 0, -1):
    #         if cave[i][j] == '.':
    #             seen_right[i][j] = seen_right[i][j + 1] + 1
    #             seen_down[i][j] = seen_down[i + 1][j] + 1
    
    # for i in range(1, N - 1):
    #     for j in range(1, N - 1):
    #         seen[i][j] = max(0, seen_left[i][j] + seen_up[i][j] + seen_right[i][j] + seen_down[i][j] - 3)

    transformed_cave = [
        [1 if item == '.' else None for item in row]
        for row in cave
    ]

    return [
        [None if item is None else item - 3 for item in row]
        for row in calc_cum(transformed_cave, int.__add__)
    ]


def min_cell(cell1, cell2):
    if cell1[0] < cell2[0]:
        return cell1
    return cell2


def make_mapping(seen):
    # N = len(seen)
    # minimum = [
    #     [
    #         (seen[i][j], (i, j)) for j in range(N)
    #     ] for i in range(N)
    # ]
    # minimum_dir = [[
    #     [
    #         (seen[i][j], (i, j)) for j in range(N)
    #     ] for i in range(N)
    # ] for _ in range(4)]

    # for i in range(1, N - 1):
    #     for j in range(1, N - 1):
    #         if seen[i][j] != 0:
    #             if minimum_dir[0][i][j - 1][0] != 0 and minimum_dir[0][i][j - 1][0] < minimum_dir[0][i][j][0]:
    #                 minimum_dir[0][i][j] = minimum_dir[0][i][j - 1]
    #             if minimum_dir[1][i - 1][j][0] != 0 and minimum_dir[1][i - 1][j][0] < minimum_dir[1][i][j][0]:
    #                 minimum_dir[1][i][j] = minimum_dir[1][i - 1][j]

    # for i in range(N - 2, 0, -1):
    #     for j in range(N - 2, 0, -1):
    #         if seen[i][j] != 0:
    #             if minimum_dir[2][i][j + 1][0] != 0 and minimum_dir[2][i][j + 1][0] < minimum_dir[2][i][j][0]:
    #                 minimum_dir[2][i][j] = minimum_dir[2][i][j + 1]
    #             if minimum_dir[3][i + 1][j][0] != 0 and minimum_dir[3][i + 1][j][0] < minimum_dir[3][i][j][0]:
    #                 minimum_dir[3][i][j] = minimum_dir[3][i + 1][j]

    transformed_seen = [
        [None if item is None else (item, (i, j)) for j, item in enumerate(row)]
        for i, row in enumerate(seen)
    ]
    minimum = calc_cum(transformed_seen, min_cell)

    mapping = set()
    # for i in range(1, N - 1):
    #     for j in range(1, N - 1):
    #         if seen[i][j] != 0:
    #             for dir in range(4):
    #                 if minimum_dir[dir][i][j][0] < minimum[i][j][0]:
    #                     minimum[i][j] = minimum_dir[dir][i][j]
    #             mapping.add(minimum[i][j][1])

    for row in minimum:
        for item in row:
            if item is not None:
                mapping.add(item[1])
    
    return mapping


def gen_puzzle(N):
    cave = [['#'] * (N + 2)] + \
        [['#'] + ['.'] * N + ['#'] for _ in range(N)] + \
        [['#'] * (N + 2)]

    candidates = {
        (1, i) for i in range(1, N)
    } | {
        (i, N) for i in range(1, N)
    } | {
        (N, i) for i in range(2, N + 1)
    } | {
        (i, 1) for i in range(2, N + 1)
    }

    n_occupied = random.randint(int(0.5 * N * N), int(0.75 * N * N))

    for i in range(n_occupied):
        add_random_candidate(cave, candidates)

    for row in cave:
        print(''.join(row))


    seen = calc_seen(cave)

    mapping = make_mapping(seen)

    puzzle = [[0] * N for _ in range(N)]

    for i, j in mapping:
        puzzle[i - 1][j - 1] = seen[i][j]

    for row in puzzle:
        print('\t'.join(map(str, row)))
    
    return puzzle

if __name__ == '__main__':
    puzzle = gen_puzzle(11)


    # cave = [
    #     ['.', '#', '.'],
    #     ['.', '.', '.'],
    #     ['.', '.', '.']
    # ]

    # cave = [
    #     ['.', '#', '.'],
    #     ['.', '.', '#'],
    #     ['.', '.', '.']
    # ]

    # cave = [
    #     ['.', '#', '#'],
    #     ['.', '.', '#'],
    #     ['.', '.', '.']
    # ]

    # cave = [
    #     ['#', '#', '#'],
    #     ['.', '.', '#'],
    #     ['.', '.', '.']
    # ]

    # cave = [
    #     ['#', '#', '#'],
    #     ['.', '.', '#'],
    #     ['#', '.', '.']
    # ]

    # cave = [
    #     ['#', '#', '#'],
    #     ['.', '.', '#'],
    #     ['#', '.', '.']
    # ]

    # print(check(cave, 1, 1))
    

    