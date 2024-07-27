import sys
import justpy as jp
from src.algorithm.vizualization import make_table

port = int(sys.args[1])
jp.justpy(make_table, port=port)