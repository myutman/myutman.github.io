import sys
import justpy as jp
from src.algorithm.vizualization import make_table

host = sys.argv[2]
port = int(sys.argv[1])
jp.justpy(make_table, host=host, port=port)