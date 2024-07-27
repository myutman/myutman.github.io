import sys
import justpy as jp
from src.algorithm.vizualization import make_table

jp.justpy(make_table, host="localhost", start_server=False)
server = jp.app