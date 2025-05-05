import {AttachablePlayerAnchor, Entity, LocalEvent, NetworkEvent, Player, SpawnPointGizmo, Vec3} from "horizon/core";


export const pacmanInvinsiblityTime = 10;
export const anchorBodyPart = AttachablePlayerAnchor.Head;
export const setupDelaySecs = 10;
export const gameCheckFrequencySecs = 1;
export const EDIBLE_SECONDS = 20;
export const DOTS_TO_SHOW_FRUIT = 70;
export const POINTS_AS_PACMAN_VARIABLE = "";

export const LOBBY_SCALE = 9;
export const GAME_SCALE = 0.1;

export enum GameState {
  'Waiting',
  'Starting',
  'Playing',
  'Ending'
}

export function MazeRunnerVariable(shortVariable: string){
  return "MazeRunner: " + shortVariable;
}


export const Events = {

  registerPacDot: new NetworkEvent<{pacDot: Entity}>('registerPacDot'),
  setPacman: new NetworkEvent<{ pacMan: Player }>("SetPacman"),
  pacmanDead: new NetworkEvent<{}>("pacmanDead"),
  touchedByPacman: new NetworkEvent<{}>("touchedByPacman"),
  startPlayerAssignment: new NetworkEvent<{force: boolean}>("startPlayerAssignment"),
  fruitCollected: new NetworkEvent<{points: number}>("fruitCollected"),
  fruitCollectable: new NetworkEvent<{}>("fruitCollectable"),
  pacDotCollected: new NetworkEvent<{ pacDot: Entity }>("pacDotCollected"),
  powerPelletCollected: new NetworkEvent<{powerPellet: Entity}>("powerPelletCollected"),
  ghostCaughtPacman: new NetworkEvent<{}>("ghostCaughtPacman"),
  resetGame: new NetworkEvent<{}>("resetGame"),
  setQueue1ReadyState: new NetworkEvent<{ready: boolean}>("setQueue1ReadyState"),
  setQueue2ReadyState: new NetworkEvent<{ready: boolean}>("setQueue2ReadyState"),
  updatePlayersInQueue: new NetworkEvent<{queue1: Player[], queue2: Player[]}>("updatePlayersInQueue"),
  joinQueue1: new NetworkEvent<{player: Player}>("joinQueue1"),
  joinQueue2: new NetworkEvent<{player: Player}>("joinQueue2"),
  leaveQueue1: new NetworkEvent<{player: Player}>("leaveQueue1"),
  leaveQueue2: new NetworkEvent<{player: Player}>("leaveQueue2"),
  makeGhostEdible: new NetworkEvent<{}>("makeGhostEdible"),
  // moveToStart: new NetworkEvent<{}>("moveToStart"),
  roleAssignmentComplete: new NetworkEvent<{}>("roleAssignmentComplete"),
  teleportPacman: new NetworkEvent<{location: Vec3}>("teleportPacman"),
  respawnPacman: new NetworkEvent<{}>("respawnPacman"),
  gameEnding: new NetworkEvent<{}>("gameEnding"),
  hideLobbyUI: new NetworkEvent<{}>('hideLobbyUI'),
  showLobbyUI: new NetworkEvent<{}>("showLobbyUI"),
  changeGameState: new NetworkEvent<{state: GameState}>("changeGameState"),
  startNow: new NetworkEvent<{}>("startNow"),
  updateCurrentGamePlayers: new NetworkEvent<{players:Player[]}>("updateCurrentGamePlayers"),
  addPacmanPoints: new NetworkEvent<{points: number}>("addPacmanPoints"),
  dragonWin: new NetworkEvent<{}>("dragonWin"),
  ghostWin: new NetworkEvent<{}>("ghostWin"),
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
    this.queue1.removePlayer(player);
    this.queue2.removePlayer(player);
    if (this.pacman === player) {this.pacman = undefined;}
    this.ghosts.removePlayer(player);
    this.queue1.removePlayer(player);
    this.queue2.removePlayer(player);
  }
}