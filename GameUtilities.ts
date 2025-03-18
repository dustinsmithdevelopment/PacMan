import {AttachablePlayerAnchor, Entity, LocalEvent, Player} from "horizon/core";

export const movementSpeed = 4.5
export const anchorBodyPart = AttachablePlayerAnchor.Torso;

export enum GameState {
  'Waiting',
  'Starting',
  'Playing',
  'Ending'
}


export const Events = {
  registerPowerPellet: new LocalEvent<{pellet: Entity}>('registerPowerPellet'),
  setPacman: new LocalEvent<{ pacMan: Player }>("SetPacman"),
  collectFruit: new LocalEvent<{ fruitValue :number }>("collectFruit"),
  pacmanDead: new LocalEvent<{}>("pacmanDead"),
  touchedByPacman: new LocalEvent<{}>("touchedByPacman"),
  startConstantMotion: new LocalEvent<{}>("startConstantMotion"),
  stopConstantMotion: new LocalEvent<{}>("stopConstantMotion"),
  assignPlayer: new LocalEvent<{ player:Player }>("assignPlayer"),
  unassignPlayer: new LocalEvent<{}>("unassignPlayer"),
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
    if (this.players.includes(player)) {
      this.players.splice(this.players.indexOf(player), 1);
    }

  }
}

export class GamePlayers {
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
    this.all.addPlayer(player);
    if (this.pacman === player) {
      this.pacman = undefined;
    }
    this.ghosts.removePlayer(player);
    this.inWaitingArea.addPlayer(player);

  }
  makePacman(player: Player) {
    this.inWaitingArea.removePlayer(player);
    this.pacman = player;
  }
  makeGhost(player: Player) {
    if (this.ghosts.size() < 4){
      this.inWaitingArea.removePlayer(player);
      this.ghosts.addPlayer(player);
    }
  }
  removePlayer(player: Player) {
    this.all.removePlayer(player);
    this.inWaitingArea.removePlayer(player);
    this.ghosts.removePlayer(player);
    if (this.pacman === player) {
      this.pacman = undefined;
    }
  }
}