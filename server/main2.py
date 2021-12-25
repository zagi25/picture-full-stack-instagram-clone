#!/usr/bin/env python3
import socket
import os
from modules.server import Server

HOST = '192.168.1.25'
PORT = 8000



if __name__ == '__main__':
    server = Server(HOST, PORT)
    server.start()
