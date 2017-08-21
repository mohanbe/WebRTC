import select
from socket import *
import re,base64,hashlib
inputs=[]
outputs=[]
inque={}
class Soc:
      def __init__(self,host="192.168.43.90",port=8888):
          self.s=socket(AF_INET,SOCK_STREAM)
          self.s.setsockopt(SOL_SOCKET,SO_REUSEADDR,1)
          self.s.setblocking(0)
          self.s.bind((host,8888))
          self.s.listen(10)
          print("Socket Ready")
          self.data=""
          inputs.append(self.s)
       
      def sendal(self,write,data,fr):
          for r in write:
              if r is not fr:
                r.sendall(data);
      def hand(self,p):
          t=p.recv(1024).decode()
          #print(t)
          y="258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
          m=re.search("Key:(.*)==",t);
          n=m.group()
          n=n[5:]
          x=n+y
          x=x.encode()
          x=base64.b64encode(hashlib.sha1(x).digest())
          h=('HTTP/1.1 101 Switching Protocols\r\n'
          'Upgrade: WebSocket\r\n'
          'Connection: Upgrade\r\n'
          'Sec-WebSocket-Accept: '+x.decode()+'\r\n\r\n')
          try:
             p.send(h.encode())
             return;
          except:
             print("Error")
             return;
      def start(self):
         while True:
          read,write,err=select.select(inputs,outputs,inputs)
          if len(read)>0:
             for r in read:
                 if r is self.s:
                      p,a=r.accept()
                      self.hand(p)
                      p.setblocking(0)
                      print("Client Connected:"+str(a))
                      inputs.append(p)
                      outputs.append(p)
                      inque[p]=a
                 else:
                      recvd=r.recv(4096)
                      self.data=recvd
                      while len(recvd)>=4096:
                          recvd=r.recv(4096)
                          self.data+=recvd
                      if not self.data:
                         inputs.remove(r)
                         print("Socket Closed:"+str(inque[r]))
                         outputs.remove(r)
                         del inque[r]
                      else:
                         if r not in outputs:
                              outputs.append(r)
                         self.sendal(write,self.data,r)
                              #print(repr(self.data))
          if len(err)>0:
              print("Disconnected")
              for e in err:
                  inputs.remove(e)
                  if e in outputs:
                     outputs.append(e)
                  del inque[e]
                  print("Socket Closed"+str(e))
                  e.close()
asyn=Soc()
asyn.start()
