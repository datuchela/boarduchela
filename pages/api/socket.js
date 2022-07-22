import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    function onConnection(socket) {
      socket.on('drawing', (data) => socket.broadcast.emit('drawing', data))
    }

    io.on('connection', onConnection)
  }
  res.end()
}

export default SocketHandler
