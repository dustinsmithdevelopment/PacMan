import {LocalEvent, NetworkEvent, Player} from "horizon/core";

export enum GameState {
  'Ready',
  'Starting',
  'Playing',
  'Ending'
}


export const Events = {
  setPacman: new NetworkEvent<{ pacMan: Player }>("SetPacman"),
  collectFruit: new LocalEvent<{ fruitValue :number }>("collectFruit"),

}
export class PlayerList {
  players: Player[] = [];

  size(): number {
    return this.players.length;
  }
  addPlayer(player: Player) {
    if (!this.players.includes(player)){
      this.players.push(player);
    }
  }
  hasPlayer(player: Player) {
    return this.players.includes(player);
  }
  indexOfPlayer(player: Player) {
    if (!this.players.includes(player)) {
      return this.players.indexOf(player);
    }else {
      return -1;
    }

  }
  removePlayer(player: Player) {
    this.players.splice(this.players.indexOf(player), 1);
  }
}

export class MatchPlayers {
  all: PlayerList = new PlayerList();
  inWaitingArea: PlayerList = new PlayerList();
  pacman: Player | undefined;
  ghosts: PlayerList = new PlayerList();


  isInWaitingArea(player: Player) {
    return this.inWaitingArea.hasPlayer(player);
  }
  isInGame(player: Player) {
    return ([this.pacman, ...this.ghosts.players].includes(player));
  }
  isPacman(player: Player) {
    return this.pacman === player;
  }
  isGhost(player: Player) {
    return this.ghosts.hasPlayer(player);
  }
  playersInGame(){
    if (this.pacman){
      return [this.pacman, ...this.ghosts.players];
    } else {
      return this.ghosts.players;
    }

  }
  moveToWaitingArea(player: Player) {
    if (this.pacman === player) {
      this.pacman = undefined;
    }
    if (this.ghosts.hasPlayer(player)) {
      this.ghosts.removePlayer(player);
    }
  }
  makePacman(player: Player) {
    this.inWaitingArea.removePlayer(player);
    this.pacman = player;
  }
  makeGhost(player: Player) {
    this.inWaitingArea.removePlayer(player);
    if (this.ghosts.size() < 4){
      this.ghosts.addPlayer(player);
    }
  }
}