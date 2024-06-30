/* eslint-disable*/
const Lobby = require('../Schema/Lobby');

const sockets = {};
const Dictionnary = require('../GestionMots/Envoiemot');
const Algo = require('../util/levestein');



sockets.start = function (io) {
  let delayTimeout;
  let cpt;
  let cptFind;
  let pcr; // player count round
  intervalID = setInterval(() => {
    cpt--;
  }, 1000);

  const findLobby = () => {
    const arr = Array.from(io.lobby.values());
    const freeLobbies = arr.filter(lobby => lobby.listPlayer.length < lobby.maxPlayer);
    if (freeLobbies.length == 0) {
      lobby = new Lobby();
      io.lobby.set(lobby.id, lobby);
    } else {
      lobby = freeLobbies[0];
    }
    return lobby;
  };
  io.lobby = new Map();
  io.on('connection', (socket) => {
    const generateTimeout = (time, callback) => {
      console.log('Generated a timeout');
      return setTimeout(callback, time * 1000);
    };
    const goNextTurn = () => {
      pcr = lobby.listPlayer.length;
      cpt = 120;
      cptFind = 0;
      if (socket.lobby.currentWord) io.to(socket.lobby.id).emit('announcement', `The word was : ${socket.lobby.currentWord}`);
      socket.lobby.clearGuessedPlayer();
      // insérer changement

      if (lobby == null) console.log('lobby null dans goNextTurn');

      socket.lobby.getNextDrawer();

      io.to(socket.lobby.id).emit('updateLobby', { lobby, listPlayer: lobby.listPlayer });
      if (!lobby.currentDrawer) return;
      io.to(socket.lobby.id).emit('drawer', socket.lobby.currentDrawer);
      socket.lobby.currentWord = Dictionnary.tirerMots('fr-FR');
      socket.lobby.guessed = false;
      io.to(socket.lobby.id).emit('wordToBeDrawn_Underscored', Dictionnary.underscoreWordToBeDrawn(socket.lobby.currentWord));

      // sends the full word only to the drawer
      io.to(socket.lobby.currentDrawer.socketID).emit('wordToBeDrawn', socket.lobby.currentWord);
      io.to(socket.lobby.id).emit('announcement', 'Everyone has 2 minutes to guess the word!');
      io.to(socket.lobby.id).emit('startTimer', 120);

      console.log('Resetting delayTimeout to 120');
      console.log('delayTImeoutID old: ', delayTimeout);
      clearTimeout(delayTimeout);
      delayTimeout = generateTimeout(120, goNextTurn);
      console.log('delayTImeoutID new: ', delayTimeout);
    };
    socket.isInGame = false;
    socket.on('findGame', async (username) => {
      const lobby = findLobby(io);
      lobby.join(socket.id, username);
      socket.username = username;
      socket.lobby = lobby;
      socket.join(lobby.id);
      socket.isInGame = true;
      socket.emit('joinedGame', { lobby });
      io.to(socket.lobby.id).emit('updateLobby', { lobby, listPlayer: lobby.listPlayer });
      io.to(socket.lobby.id).emit('peopleJoin', socket.username);
      if (!lobby.started && lobby.listPlayer.length > 1) {
        lobby.started = true;

        io.to(socket.lobby.id).emit('announcement',
          'The game will start in 5 seconds!');
        io.to(socket.lobby.id).emit('startTimer',
          4.5);
        clearTimeout(delayTimeout);
        delayTimeout = generateTimeout(5, goNextTurn);
      }
    });

    socket.on('sendChat', async (msg) => {
      if (!socket.isInGame) return socket.emit('Unauthorized', 'You are not allowed to send this command!');
      if ((msg == socket.lobby.currentWord && socket.lobby.containsGuessedPlayer(socket.id)) || socket.id == socket.lobby.currentDrawer.socketID) {
        socket.emit('notAllowedToEnterAnswer');
        return;
      }
      if (!socket.lobby.started) {
        io.to(socket.lobby.id).emit('receiveChat', socket.username, msg);
        return;
      }


      if (Algo.compareString(msg, socket.lobby.currentWord) > 0.8 && msg != socket.lobby.currentWord) {
        socket.emit('closeGuess');
      }
      if (msg == socket.lobby.currentWord) {
        cptFind++;
        io.to(socket.lobby.id).emit('guessedPlayer', socket.username);

        socket.lobby.addPoint(socket.id, 1);
        socket.lobby.addGuessedPlayer(socket.id);
        io.to(socket.lobby.id).emit('updateLobby', { lobby, listPlayer: lobby.listPlayer });

        // if(socket.lobby.guessed) return;
        if (pcr != (cptFind + 1)) {
          console.log(`test:${lobby.listPlayer.length} et ${cptFind + 1}`);
          console.log(lobby.listPlayer.length != (cptFind + 1));
          if (cpt > 20 && !socket.lobby.guessed) {
            io.to(socket.lobby.id).emit('announcement', 'Time shortened to 20 seconds');
            io.to(socket.lobby.id).emit('startTimer', 20);
            socket.lobby.guessed = true;
            console.log('Resetting to 20 and start');
            clearTimeout(delayTimeout);
            delayTimeout = generateTimeout(20, goNextTurn);
          }
        }
        console.log('coucou!!');
        if ((pcr) == (cptFind + 1)) {
          console.log('Ninja');
          goNextTurn();
        }
      } else {
        io.to(socket.lobby.id).emit('receiveChat', socket.username, msg);
      }
    });

    socket.on('draw', (msg) => {
      if (!socket.isInGame) return socket.emit('Unauthorized', 'You are not allowed to send this command!');
      io.to(socket.lobby.id).emit('drawCmd', msg);
    });

    socket.on('clearDrawing', (msg) => {
      if (!socket.isInGame) return socket.emit('Unauthorized', 'You are not allowed to send this command!');
      io.to(socket.lobby.id).emit('clearDrawing', msg);
    });

    socket.on('requestListPlayer', () => {
      if (!socket.isInGame) return socket.emit('Unauthorized', 'You are not allowed to send this command!');
      io.to(socket.lobby.id).emit('listPlayer', { listPlayer: socket.lobby.listPlayer });
    });

    socket.on('disconnect', () => {
      if (!socket.lobby) return;
      socket.lobby.leave(socket.id);
      pcr--;
      io.to(socket.lobby.id).emit('disconnectPlayer',
        'socket.username');
      io.to(socket.lobby.id).emit('updateLobby',
        { lobby: socket.lobby, listPlayer: socket.lobby.listPlayer });
      if (socket.lobby.listPlayer.length < 2) {
        io.to(socket.lobby.id).emit('announcement',
          'Not enough players! Game resetted. Waiting for a second player...');
        socket.lobby.resetGame();
        return;
      }
      if (socket.id == socket.lobby.currentDrawer.socketID) goNextTurn(io, socket);
    });

    socket.on('sendWordList', (wordlist) => {
      if (!socket.isInGame) return socket.emit('Unauthorized', 'You are not allowed to send this command!');
      io.to(socket.lobby.id).emit('receiveWordList', wordlist);
    });

    socket.on('drawingSideOption', (option) => {
      if (!socket.isInGame) return socket.emit('Unauthorized', 'You are not allowed to send this command!');
      io.to(socket.lobby.id).emit('viewerSideOption', option);
      console.log(JSON.stringify(option));
    });
  });
};

module.exports = sockets;
