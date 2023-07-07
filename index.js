const app = require("express")();
const server = app.listen(8000, () => console.log("listening to 8000"));
let players = new Array();

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5713",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log('A user joined!');

  socket.on('overlays:announce', (string, modalType) => {
    socket.emit('overlays:announce', string, modalType)
  });

  socket.on("player:joined", ({id, color, playerName}) => {
    // Tell everyone except the sender that a new player has joined!
    socket.broadcast.emit("player:joined", {id, color, playerName})
    // Tell the sender only that there are X amount of players with ids already in room.
    socket.emit('players:list', {list: players, identity: id});
    
    // Update player's record!
    players.push({id, color, playerName});
  });
  socket.on("player:mouse-move", ({movementX, movementY, id}) => {
    socket.broadcast.emit("player:mouse-move", {movementX, movementY, id});
  });
  socket.on("player:keys-move", ({pressedKeys, currentKey, id}) => {
    socket.broadcast.emit("player:keys-move", {pressedKeys, currentKey, id});
  });
  socket.on("player:shot", ({shotUser, playerName, id}) => {
    socket.broadcast.emit('player:shot', {shotUser, playerName, id});
  });
  socket.on('player:leave', (leavingUserId) => {
    socket.broadcast.emit('player:leave', {id: leavingUserId});
    players = players.filter(({ id }) => id !== leavingUserId)
  })
});