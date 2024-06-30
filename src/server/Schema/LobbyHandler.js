/* eslint-disable global-require */
var Lobby = require('./Lobby');
const mongoose = require('mongoose');
/**
 * Handles all the connections and lobbies
 *
 * @class LobbyHandler
 */
class LobbyHandler {
/**
 *Creates an instance of LobbyHandler.
    * @param {*} httpServer
    * @memberof LobbyHandler
    */
  constructor(httpServer) {
    this.lobbies = new Map();
    this.io = require('socket.io')(httpServer);
    this.initConnect();
  }

  /**
     *
     *
     * @returns {Lobby} lobby
     * @memberof LobbyHandler
     */
  findLobby(lang) {
    const arr = Array.from(this.lobbies.values());
    const freeLobbies = arr.filter(lobby => lobby.listPlayer.length < lobby.maxPlayer && lobby.lang == lang);
    let lobby;
    if (freeLobbies.length == 0) {
      lobby = new Lobby(this,lang);
      this.lobbies.set(lobby.id, lobby);
    } else {
      [lobby] = freeLobbies;
    }
    return lobby;
  }


  initConnect() {
    const handler = this;

    this.io.on('connection', (player) => {
      player.on('findGame', async (username,lang,accountID) => {
        player.lobby = handler.findLobby(lang);
        if(accountID)
        {
          const User = mongoose.model('User');
          var connectedUser = await User.findById(accountID);
          player.user = connectedUser;
          console.log(player.user)
        }
        player.lobby.addPlayer(player,username);
        player.lobby.registerEvents(player);
        
      });
    });
  }
}

module.exports = LobbyHandler;