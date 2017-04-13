var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var io = require('socket.io').listen('8080');
var players = new Array();
io.on('connection', function(socket) {
  console.log(socket.id + ' connected');
  socket.on('setId', function (data) {
    if (data.id == -1) {
      var id = players.length;
      players[players.length] = new Array(socket.id, 0);
      socket.emit('giveId', {id: id});
      socket.emit('log', {msg: "Ссылка для присоединения: valentiay.tk/chess?id=" + id});
    }
    else {
      var id = data.id;
      if(players[id] == undefined){
        socket.emit('cerror', {msg: "Вы хулиган"});
      }
      else if (players[id][1] != 0 && players[id][2] != 0) {
        socket.emit('сerror', {msg: "Место уже занято"});
      }
      else if (players[id][0] == 0) {
        io.sockets.sockets[players[id][0]].emit('setColor', {color: "white"});
        io.sockets.sockets[players[id][1]].emit('setStatus', {status: 2});
        io.sockets.sockets[players[id][0]].emit('setStatus', {status: 0});
        io.sockets.sockets[players[id][1]].emit('log', {msg: "Кто-то присоединился, ваш ход"});
      }
      else {
        players[id][1] = socket.id;
        io.sockets.sockets[players[id][1]].emit('setColor', {color: "black"});
        io.sockets.sockets[players[id][0]].emit('setStatus', {status: 0});
        io.sockets.sockets[players[id][1]].emit('setStatus', {status: 2});
        io.sockets.sockets[players[id][0]].emit('log', {msg: "Кто-то присоединился, ваш ход"});
      }
    }
  });
  socket.on('xod', function(data){
    if(socket.id == players[data.id][0]){
      io.sockets.sockets[players[data.id][1]].emit('giveField',{xFrom: data.xFrom, yFrom: data.yFrom, xTo: data.xTo, yTo:data.yTo});
      io.sockets.sockets[players[data.id][1]].emit('setStatus', {status: 0});
    }
    else{
      io.sockets.sockets[players[data.id][0]].emit('giveField',{xFrom: data.xFrom, yFrom: data.yFrom, xTo: data.xTo, yTo:data.yTo});
      io.sockets.sockets[players[data.id][0]].emit('setStatus', {status: 0});
    }
  });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
