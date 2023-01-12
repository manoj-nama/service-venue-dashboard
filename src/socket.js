let io;

const emitToListner = async (Listner_Name, data) => {
  io.sockets.emit(Listner_Name, data);
};

const afterConnect = async (io) => {
  io.on('connection', async (socket) => {
    console.log('Connection success', socket.id);
    socket.on('disconnect', () => {
      console.log('Connection disconnected', socket.id);
    });
  });
};

module.exports = {
  init: (server) => {
    io = require('socket.io')();
    io.attach(server, { cors: { origin: '*' } });
    return io;
  },
  get: () => {
    if (!io) {
      throw new Error('socket is not initialized');
    }
    return io;
  },
  afterConnect,
  emitToListner,
};
