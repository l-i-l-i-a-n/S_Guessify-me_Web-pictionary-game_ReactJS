/* eslint-disable class-methods-use-this */

const uniqid = require('uniqid');
const Dictionnary = require('../GestionMots/Envoiemot')
const Algo = require('../util/levestein')
const mongoose = require('mongoose');
/**
 *
 * Convert a Socket Obect to JSON in order to able to transmit through Websocket
 * @param {SocketIO.Socket} socket
 * @returns {Object} parsedJSON
 */
const convertToJSON = (socket) => {
  return {
      socketID: socket.id,
      username: socket.username,
      pointsTotal: socket.pointsTotal
    }
  }


  function getTimeLeft(timeout) {
    return Math.ceil((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000);
}
  
class Lobby {
  /**
   *Creates an instance of Lobby.
   * @param {} handler
   * @memberof Lobby
   */
  constructor(handler,lang) {
    this.id = uniqid();
    this.lang = lang
    this.maxPlayer = 10;
    this.inGame = false;
    this.listPlayer = [];
    this.guessedPlayer = [];
    this.started = false;
    this.currentDrawer = null;
    this.timer = null;
    this.handler = handler;
    this.drawing = []
  }


  // Socket related command
  emitAll(event, ...data) {
    this.handler.io.to(this.id).emit(event,...data);
  }

  emitAllExceptSender(event, ...data) {
    this.handler.io.to(this.id).emit(event, ...data);
  }


  /**
   * Starts the game and count down of 5 sec
   *
   * @memberof Lobby
   */
  startGame() {
    this.started = true;
    this.emitAll('announcement', 'The game will start in 5 seconds!');
    this.startTimer(5);
  }

  /**
   * Doing cleanups aftet a round/turn
   *
   * @memberof Lobby
   */
  postRound() {
    this.emitAll('announcement', `The word was : ${this.currentWord}`);
    this.clearGuessedPlayer();
  }

  /**
   * Prepare the round to be started, draws the word, and send them to client
   *
   * @memberof Lobby
   */
  preRound() {
    this.getNextDrawer();
    this.updateLobby
    this.emitAll('announcement', '---------------------');
    this.emitAll('drawer', convertToJSON(this.currentDrawer));
    this.currentWord = Dictionnary.tirerMots(this.lang); // TO-DO make 3 choices
    this.emitAll('wordToBeDrawn_Underscored', Dictionnary.underscoreWordToBeDrawn(this.currentWord));
    this.guessed = false;
    // sends the full word only to the drawer
    this.currentDrawer.emit('wordToBeDrawn',this.currentWord);
    this.emitAll('announcement', 'You have 2 minutes to guess the word!');
    this.startTimer(120,this.goNextTurn,this);
    this.drawing = []
  }

  /**
   * Removes the previous timer to shorten it to 15 seconds
   *
   * @param {Number} time
   * @memberof Lobby
   */
  shortenTime(time) {
    this.emitAll('announcement', `Time shortened to ${time} seconds`);
    this.emitAll('startTimer', time);
    this.startTimer(time,this.goNextTurn,this);
  }

  /**
   * Adds the player to the guessed player list and update the lobby
   *
   * @param {SocketIO.Socket} player
   * @memberof Lobby
   */
  addGuessedPlayer(player) {
    this.emitAll('guessedPlayer', player.username);
    this.addPoint(player, 1);
    this.guessedPlayer.push(player);
    this.updateLobby();
    this.guessed = true;
   
  }


  /**
   * Send the updated lobby to all the client
   *
   * @memberof Lobby
   */
  updateLobby() {
    const processed = this.listPlayer.map(element => convertToJSON(element));

    this.emitAll('updateLobby', { listPlayer: processed });
  }

  /**
   * Treat messages/guesses in order to perform serveral actions
   *
   * @param {SocketIO.Socket} player
   * @param {String} msg
   * @memberof Lobby
   */
  sendChat(player, msg) {
    msg  = msg.substring(0, 30);
    
    // Guessed player sending the answer or Drawing player typing anything
    if ((msg == this.currentWord && this.containsGuessedPlayer(player)) || player == this.currentDrawer) return player.emit('notAllowedToEnterAnswer');

    if (!this.started) return this.emitAll('receiveChat', player.username, msg);

    // Testing similarity
    if (Algo.compareString(msg, this.currentWord) > 0.8 && msg != this.currentWord) player.emit('closeGuess');
    var word = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (word == this.currentWord && !this.containsGuessedPlayer(player) && player != this.currentDrawer)
    {
      console.log(this.guessed)
      if(!this.guessed) this.shortenTime(15)
      this.addGuessedPlayer(player);
      
    } 
    else this.emitAll('receiveChat', player.username, msg);
    
  }

  /**
   * Utils method to start the timer , resets the previous one.
   *
   * @param {Number} time
   * @param {Function} callback
   * @param {*} args
   * @memberof Lobby
   */
  startTimer(time, callback,...args) {
    this.emitAll('startTimer', time);
    clearTimeout(this.timer);
    this.timer = setTimeout(callback, time*1000,...args);
  }

  /**
   * Perform Post action for previous and Prepare for next round. Resets game if not enough player
   *
   * @param {Lobby} lobby
   * @returns
   * @memberof Lobby
   */
  goNextTurn(lobby) {
    console.log("Passing turns")
    lobby.postRound();
    // Changement d'un round
    if (lobby.listPlayer.length <= 1) return lobby.resetGame();
    lobby.preRound();
  }

    /**
   * Perform Pre action for next round. Resets game if not enough player
   *
   * @param {Lobby} lobby
   * @returns
   * @memberof Lobby
   */
  startTurn(lobby) {
    if (lobby.listPlayer.length <= 1) return lobby.resetGame();
    lobby.preRound();
  }

  /**
   * Adds a player to the lobby, verifies if the game is startable.
   *
   * @param {*} player
   * @param {*} username
   * @memberof Lobby
   */
  addPlayer(player,username) {
    this.listPlayer.push(player);
    player.join(this.id);
    player.isInGame = true;
    player.pointsTotal = 0;
    player.username = username

    // player.emit('joinedGame', { lobby })
    this.updateLobby();

    this.emitAll('peopleJoin', player.username);
    this.verifyStartable();
    console.log("end adds")
  }

  containsGuessedPlayer(socketID) {
    return this.guessedPlayer.includes(socketID);
  }

  verifyStartable() {
    if (this.started || this.listPlayer.length <= 1) return; // Lobby not startable or lobby started
    this.started = true;

    this.emitAll('announcement', 'The game will start in 5 seconds!');
    this.startTimer(5, this.startTurn,this);
  }


  /**
   * Register all the events that are inside the lobby
   *
   * @param {SocketIO.Socket} player
   * @memberof Lobby
   */
  registerEvents(player) {
    player.on('sendChat', (msg) => {
      this.sendChat(player, msg);
    });
    player.on('draw', (data) => {
      this.drawing.push(data)
      this.emitAll('drawCmd', data);
    });
    player.on('clearDrawing', () => {
      this.emitAll('clearDrawing');
    });
    player.on('requestListPlayer', () => {
      this.emitAll('listPlayer', { listPlayer: this.listPlayer.map(element => convertToJSON(element)) });
    });
    player.on('drawingSideOption', (option) => {
      this.emitAll('viewerSideOption', option);
    });
    player.on('disconnect', () => {
      this.disconnectPlayer(player);
    });
    this.sendAllDrawing(player)
  }


  clearGuessedPlayer() {
    this.guessedPlayer = [];
  }


  sendAllDrawing(player){
    this.drawing.forEach((point)=>player.emit("drawCmd",point))
  }
  /**
   * Resets the whole lobby and performs cleanup
   *
   * @memberof Lobby
   */
  resetGame() {
    // TO-DO need more logic here
    this.emitAll("resetGame")
    this.started = false;
    this.currentDrawer = null;
    this.currentDrawerIndex = null;
  }

  /**
   * Selects the next drawer, made with listPlayer in mind
   *
   * @memberof Lobby
   */
  getNextDrawer() {
    if (this.currentDrawer == null) {
      this.currentDrawer = this.listPlayer[0];
    } else {
      const pos = this.getPlayerPos(this.currentDrawer);
      this.currentDrawer = this.listPlayer[(pos + 1) % this.listPlayer.length];
    }
  }


  /**
   *
   *
   * @param {SocketIO.Socket} player
   * @memberof Lobby
   */
  async disconnectPlayer(player) {
    this.leave(player);
    if(player.user)
    {
      var User = mongoose.model("User");
      var user = await User.findOneAndUpdate({ _id: player.user._id }, { $inc: { 'pointTotal': player.pointsTotal } },{new:true});
      console.log(user)
    }

    this.emitAll('disconnectPlayer', player.username);
    this.updateLobby();
    if (this.listPlayer.length < 2) {
      this.emitAll('announcement', 'Not enough players!\nGame resetted. Waiting for a second player...');
      this.resetGame();
      return;
    }
    if(this.started)
    if (player.id == this.currentDrawer.id) this.goNextTurn(this);
  }


  /**
   * Removes a player from the listPlayer, returns true if success, false otherwise
   *
   * @param {SocketIO.Socket} player
   * @returns boolean
   * @memberof Lobby
   */
  leave(player) {
    const index = this.getPlayerPos(player);
    if (index > -1) {
      this.listPlayer.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Permet d'ajouter des points au joueur possèdant le socketID, fonction appelé exclusivement par le serveur, sous réserve de victoire.
   * @param {} socketID
   * @param {int} point : le nombre de points à ajouter
   */
  addPoint(player, point) {
    player.pointsTotal += point;
  }

  getPlayerPos(player) {
    return this.listPlayer.map(p => p.id).indexOf(player.id);
  }
}


module.exports = Lobby;
