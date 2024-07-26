from .check_solved import check_solved
from .cave_gen import gen_puzzle
import justpy as jp

import os
import json

colors = ['white', 'green', 'grey']

class MyTd(jp.Td):
    def __init__(self, i, j, color, **kwargs):
        style = f'width: 50px; text-align: center; font: arial-black; background-color: {colors[color]}'
        super().__init__(style=style, **kwargs)
        self.i = i
        self.j = j
        self.color = color
        self.on('click', self.on_click)

    def on_click(self, msg):
        print(f'{self.i} {self.j} was clicked')
        with open("./state.json") as inf:
            data = json.load(inf)

        self.color = (self.color + 1) % 3
        data["events"].append([self.i, self.j])

        with open("./state.json", "w") as ouf:
            json.dump(data, fp=ouf)

        self.style=f'width: 50px; text-align: center; font: arial-black; background-color: {colors[self.color]}'


class CheckSolvedButton(jp.Button):
    def __init__(self, **kwargs):
        super().__init__(text="Check solved", **kwargs)
        self.on('click', self.on_click)

    def on_click(self, msg):
        with open("./state.json") as inf:
            data = json.load(inf)
        
        field = data["field"]
        events = data["events"]
        occupied = [[0] * 10 for _ in range(10)]
        for i, j in events:
            occupied[i][j] = (occupied[i][j] + 1) % 3

        check = check_solved(field, occupied)
        if check:
            self.text = "Solved"
        else:
            self.text = "Not solved"

    def react(self, data):
        pass


def make_table():
    array = None
    events = []
    if not os.path.exists("./state.json"):
        array = gen_puzzle(10)
        data = {
            "field": array,
            "events": []
        }
        with open("./state.json", "w") as ouf:
            json.dump(data, fp=ouf)
    else:
        with open("./state.json") as inf:
            data = json.load(inf)
        array = data["field"]
        events = data["events"]

    occupied = [[0] * 10 for _ in range(10)]
    for i, j in events:
        occupied[i][j] = (occupied[i][j] + 1) % 3

    wp = jp.WebPage(tailwind=False)

    table = jp.Table()
    tbody = jp.Tbody(a=table)

    for i, row in enumerate(array):
        tr = jp.Tr(a=tbody, style='height: 50px')
        for j, item in enumerate(row):
            # ; background-color: green
            MyTd(i, j, occupied[i][j], text=str(item) if item != 0 else ' ', a=tr, classes='border px-4 py-2 text-center')

    CheckSolvedButton(a=wp, style='margin: 10px; font-size: 12px')

    wp.add_component(table)
    return wp
