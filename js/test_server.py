from websocket_server import WebsocketServer
import json

class MySocketServer:
    def __init__ (self):
        self.client2slide = {}
        self.slide2clients = {}
        self.slide2presentationdata = {}        
        server = WebsocketServer(port=12345, host='127.0.0.1')
        server.set_fn_new_client(self.new_client)
        server.set_fn_client_left(self.client_left)
        server.set_fn_message_received(self.message_received)
        self.server = server
        
    def remove_client(self,client):
        if client["id"] in self.client2slide:
            slide=self.client2slide.pop(client["id"])
            if slide in self.slide2clients:
                self.slide2clients[slide]=[ c for c in self.slide2clients[slide] if c != client ]

    def add_client(self,client,slide):
        self.client2slide[client["id"]]=slide
        if slide not in self.slide2clients:
            self.slide2clients[slide]=[]
        self.slide2clients[slide].append(client)
        if slide not in self.slide2presentationdata:
            self.slide2presentationdata[slide]="{}"
        

    def new_client(self, client, server):
        self.add_client(client,None)
#        self.client2slide[client["id"]]=None

    def client_left(self, client, server):
        self.remove_client(client)
        

        
    def message_received(self, client, server, message):
        data=json.loads(message)
        if "request" in data:
            self.remove_client(client)    
            slide=data["request"]["slide"]
            self.add_client(client,slide)
            message=self.slide2presentationdata[slide]
            server.send_message(client, message)
        if "marker" in data:
            slide = self.client2slide[client["id"]]
            self.slide2presentationdata[slide]=message
            for c in self.slide2clients[slide]:
                if c != client:
                    server.send_message(c, message)
        
 

if __name__ == "__main__":
    ss = MySocketServer()
    ss.server.run_forever()
    
