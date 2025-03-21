import {Component, Entity, PropTypes} from "horizon/core";
import {Events, GameState} from "./GameUtilities";

class GameManager extends Component<typeof GameManager> {
  static propsDefinition = {
    pacMan: {type: PropTypes.Entity},
    ghost1: {type: PropTypes.Entity},
    ghost2: {type: PropTypes.Entity},
    ghost3: {type: PropTypes.Entity},
    ghost4: {type: PropTypes.Entity},
  };
  private currentGameState: GameState = GameState.Waiting;
  private queue1Ready = false;
  private queue2Ready = false;
  private points = 0;
  private lives = 3;
  private allPacDots: Map<bigint, Entity> = new Map<bigint, Entity>();
  private remainingPacDots: Map<bigint, Entity> = new Map();
  preStart() {
    this.connectNetworkBroadcastEvent(Events.registerPacDot, (payload: {pacDot: Entity})=>{this.registerPacDot(payload.pacDot);});
    this.connectNetworkEvent(this.entity, Events.pacDotCollected, (payload: {pacDot: Entity})=>{this.eatPacDot(payload.pacDot);});
    this.connectNetworkEvent(this.entity, Events.setQueue1ReadyState, (payload: {ready: boolean})=>{this.updateQueue1ReadyState(payload.ready)});
    this.connectNetworkEvent(this.entity, Events.setQueue2ReadyState, (payload: {ready: boolean})=>{this.updateQueue2ReadyState(payload.ready)});
    this.connectNetworkEvent(this.entity, Events.ghostCaughtPacman, ()=>{this.loseLife();});
    this.connectNetworkEvent(this.entity, Events.powerPelletCollected, ()=>{this.powerPelletCollected()});
  }

  start() {
    this.currentGameState = GameState.Waiting;
  }
  changeGameState(newGameState: GameState) {
    if(this.currentGameState !== newGameState) {
      switch (newGameState) {
        case GameState.Waiting:
          this.resetGame();
          break;
        case GameState.Starting:
          if (this.currentGameState === GameState.Waiting){
            this.prepareGame();
          }
          break;
        case GameState.Playing:
        if (this.currentGameState === GameState.Waiting){
          this.startGame();
        }
          break;
        case GameState.Ending:
          if (this.currentGameState === GameState.Playing){
            this.endGame();
          }
      }
    }
  }
  // TODO check if any queues are ready every 10 seconds while the game isn't active
  // TODO if a ghost leaves the game, mark the slot as empty and offer it to the other players
  // TODO restrict the players rotation
  // TODO set up the game end events

  prepareGame() {
    this.remainingPacDots = new Map(this.allPacDots);
    this.lives = 3;
  }
  startGame() {}
  endGame() {}
  resetGame(){
    this.currentGameState = GameState.Waiting;
    this.sendNetworkBroadcastEvent(Events.resetGame, {});
  }
  loseLife(){
    this.lives -= 1;
    if (this.lives === 0){
      // TODO end the game as a loss
    }
  }

  registerPacDot(pacDot: Entity) {
    this.allPacDots.set(pacDot.id, pacDot);
    console.log(this.allPacDots.size + " PacDots registered");
  }
  eatPacDot(pacDot: Entity) {
    this.remainingPacDots.delete(pacDot.id);
  }
  checkRemainingPacDots() {
    if (this.remainingPacDots.size === 0) {
      // TODO end the game as a win
    }
  }
  powerPelletCollected(){
    console.log('Pacman ate a PowerPellet')
    this.sendNetworkEvent(this.props.ghost1!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost2!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost3!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost4!, Events.makeGhostEdible, {});
  }
  updateQueue1ReadyState(isReady: boolean) {
    this.queue1Ready = isReady;
    if (isReady) {
      console.log("Queue 1 is ready");
    }else {
      console.log("Queue 1 is not ready");
    }
  }
  updateQueue2ReadyState(isReady: boolean) {
    this.queue2Ready = isReady;
    if (isReady) {
      console.log("Queue 2 is ready");
    }else {
      console.log("Queue 2 is not ready");
    }
  }
}
Component.register(GameManager);