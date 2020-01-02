const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.engine('html', require('ejs').renderFile);
app.use(express.static("public"));

io.sockets.on('connection', function(socket) {
  socket.on('username', function(username) {
    socket.username = username;

    io.emit('is_online', '' + socket.username + ' has joined');

    socket.on('typing', () => {
      socket.broadcast.emit('typing', {username : socket.username});
    })

    socket.on('stopped typing', () => {
      socket.broadcast.emit('stopped typing', {username : socket.username});
    });

    socket.on('chat_message', (data) => {
      io.emit('chat_message', {message: data.message, username: socket.username});
    });  
  });

  socket.on('disconnect', function() {
    io.emit('is_online', '' + socket.username + ' has left');
  })
});


//Needed for Heroku and local environments
var port = process.env.PORT || 8080;
const sever = http.listen( port, function() {
  console.log('listening on: ' + port);
});