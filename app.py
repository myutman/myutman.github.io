import sys
import justpy as jp
from src.algorithm.vizualization import make_table

port = int(sys.argv[1])
jp.justpy(make_table, port=port)