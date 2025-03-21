import {AttachablePlayerAnchor, Entity, LocalEvent, NetworkEvent, Player} from "horizon/core";

export const movementSpeed = 4.5
export const anchorBodyPart = AttachablePlayerAnchor.Head;

export enum GameState {
  'Waiting',
  'Starting',
  'Playing',
  'Ending'
}


export const Events = {
  registerPacDot: new NetworkEvent<{pacDot: Entity}>('registerPacDot'),
  setPacman: new NetworkEvent<{ pacMan: Player }>("SetPacman"),
  collectFruit: new NetworkEvent<{}>("collectFruit"),
  pacmanDead: new NetworkEvent<{}>("pacmanDead"),
  touchedByPacman: new NetworkEvent<{}>("touchedByPacman"),
  startConstantMotion: new NetworkEvent<{}>("startConstantMotion"),
  stopConstantMotion: new NetworkEvent<{}>("stopConstantMotion"),
  assignPlayer: new NetworkEvent<{ player:Player }>("assignPlayer"),
  unassignPlayer: new NetworkEvent<{}>("unassignPlayer"),
  pacDotCollected: new NetworkEvent<{ pacDot: Entity }>("pacDotCollected"),
  powerPelletCollected: new NetworkEvent<{}>("powerPelletCollected"),
  ghostCaughtPacman: new NetworkEvent<{}>("ghostCaughtPacman"),
  resetGame: new NetworkEvent<{}>("resetGame"),
  setQueue1ReadyState: new NetworkEvent<{ready: boolean}>("setQueue1ReadyState"),
  setQueue2ReadyState: new NetworkEvent<{ready: boolean}>("setQueue1ReadyState"),
  joinQueue1: new NetworkEvent<{player: Player}>("joinQueue1"),
  joinQueue2: new NetworkEvent<{player: Player}>("joinQueue2"),
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
  inLobby: PlayerList = new PlayerList();
  queue1: PlayerList = new PlayerList();
  queue2: PlayerList = new PlayerList();
  pacman: Player | undefined;
  ghosts: PlayerList = new PlayerList();

  moveToQueue1(player: Player) {
    if (!this.queue1Full()){
      this.unassignPlayer(player);
      this.queue1.addPlayer(player);
    }
  }
  moveToQueue2(player: Player) {
    if (!this.queue2Full()){
      this.unassignPlayer(player);
      this.queue2.addPlayer(player);
    }
  }
  queue1Full() {
    return this.queueIsFull(this.queue1);
  }
  queue2Full() {
    return this.queueIsFull(this.queue2);
  }
  queueIsFull(queue: PlayerList) {
    return queue.size() == 5;
  }
  isInLobby(player: Player) {
    return this.inLobby.hasPlayer(player);
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
  moveToLobby(player: Player) {
    this.unassignPlayer(player);
    this.inLobby.addPlayer(player);

  }
  makePacman(player: Player) {
    this.unassignPlayer(player);
    this.pacman = player;
  }
  makeGhost(player: Player) {
    if (this.ghosts.size() < 4){
      this.unassignPlayer(player);
      this.ghosts.addPlayer(player);
    }
  }
  removePlayer(player: Player) {
    this.all.removePlayer(player);
    this.unassignPlayer(player);
  }
  unassignPlayer(player: Player) {
    this.inLobby.removePlayer(player);
    if (this.pacman === player) {this.pacman = undefined;}
    this.ghosts.removePlayer(player);
    this.queue1.removePlayer(player);
    this.queue2.removePlayer(player);
  }
}