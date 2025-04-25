import {Component, Entity, Player, PropTypes, Vec3} from "horizon/core";
import {Events, gameCheckFrequencySecs, GameState, pacmanInvinsiblityTime, setupDelaySecs} from "./GameUtilities";

class GameManager extends Component<typeof GameManager> {
  static propsDefinition = {
    playerManager : {type: PropTypes.Entity, required: true},
    pacMan: {type: PropTypes.Entity, required: true},
    ghost1: {type: PropTypes.Entity, required: true},
    ghost2: {type: PropTypes.Entity, required: true},
    ghost3: {type: PropTypes.Entity, required: true},
    ghost4: {type: PropTypes.Entity, required: true},

  };
  private currentGameState: GameState = GameState.Waiting;
  private queue1Ready = false;
  private queue2Ready = false;
  private points = 0;
  private lives = 3;
  private allPacDots: Map<bigint, Entity> = new Map<bigint, Entity>();
  private remainingPacDots: Map<bigint, Entity> = new Map();
  private queue1PlayerCount = 0;
  preStart() {
    this.connectNetworkEvent(this.entity ,Events.registerPacDot, (payload: {pacDot: Entity})=>{this.registerPacDot(payload.pacDot);});
    this.connectNetworkBroadcastEvent(Events.pacDotCollected, (payload: {pacDot: Entity})=>{this.eatPacDot(payload.pacDot);});
    this.connectNetworkEvent(this.entity, Events.setQueue1ReadyState, (payload: {ready: boolean})=>{this.updateQueue1ReadyState(payload.ready)});
    this.connectNetworkEvent(this.entity, Events.setQueue2ReadyState, (payload: {ready: boolean})=>{this.updateQueue2ReadyState(payload.ready)});
    this.connectNetworkEvent(this.entity, Events.ghostCaughtPacman, ()=>{this.loseLife();});
    this.connectNetworkBroadcastEvent(Events.powerPelletCollected, ()=>{this.powerPelletCollected()});
    this.connectNetworkBroadcastEvent(Events.updatePlayersInQueue, (payload: {queue1: Player[], queue2: Player[]})=>{this.queue1PlayerCount = payload.queue1.length;});
    this.connectNetworkEvent(this.entity, Events.startNow, this.forceStartGame.bind(this));
    this.connectNetworkEvent(this.entity, Events.roleAssignmentComplete, ()=>{this.changeGameState(GameState.Playing);});
  }

  start() {
    this.async.setTimeout(()=>{
      this.async.setInterval(this.checkIfReadyToStart.bind(this), 1000*gameCheckFrequencySecs)
    }, 1000*setupDelaySecs);
  }
  checkIfReadyToStart() {
    if (this.currentGameState === GameState.Waiting){
      // waiting to start the game
      if (this.queue1Ready || this.queue2Ready) {
        this.changeGameState(GameState.Starting);
      }
    }
  }
  forceStartGame(){
    console.log("Attempting to force start the game")
    if (this.currentGameState === GameState.Waiting && this.queue1PlayerCount >= 2){
      this.changeGameState(GameState.Starting);
    }
  }
  changeGameState(newGameState: GameState) {
    if(this.currentGameState !== newGameState) {
      switch (newGameState) {
        case GameState.Waiting:
          this.resetGame();
          break;
        case GameState.Starting:
            console.log("Requested to change game state to waiting");
          if (this.currentGameState === GameState.Waiting){
            console.log("Changing Game State to Starting");
            this.prepareGame();
          }
          break;
        case GameState.Playing:
          console.log("Requested to change game state to playing")
        if (this.currentGameState === GameState.Starting){
          this.startGame();
        }
          break;
        case GameState.Ending:
          console.log("Requested to change game state to ending")
          if (this.currentGameState === GameState.Playing){
            this.endGame();
          }
      }
      this.sendNetworkBroadcastEvent(Events.changeGameState, {state: this.currentGameState});
    }
  }
  // TODO if a ghost leaves the game, mark the slot as empty and offer it to the other players

  prepareGame() {
    this.pacmanInvincible = true;
    this.currentGameState = GameState.Starting;
    this.remainingPacDots = new Map(this.allPacDots);
    this.lives = 3;
    this.sendNetworkEvent(this.props.playerManager!, Events.startPlayerAssignment, {force: (!(this.queue1PlayerCount >= 5))});
  }
  startGame() {
    this.pacmanInvincible = false;
    // console.log("Changing Game State to Playing");
    this.currentGameState = GameState.Playing;

  }
  endGame() {
    this.pacmanInvincible = true;
    // console.log("Changing Game State to Ending");
    this.currentGameState = GameState.Ending;
    this.sendNetworkEvent(this.props.playerManager!, Events.gameEnding, {});
    this.async.setTimeout(()=>{this.changeGameState(GameState.Waiting)}, 5_000)
  }
  resetGame(){
    // console.log("Changing Game State to Waiting");
    this.currentGameState = GameState.Waiting;
    console.log("Sending Game Reset")
    this.sendNetworkBroadcastEvent(Events.resetGame, {});
    const pacman: Entity = this.props.pacMan!
    const ghosts: Entity[] = [];
    ghosts.push(this.props.ghost1!);
    ghosts.push(this.props.ghost2!);
    ghosts.push(this.props.ghost3!);
    ghosts.push(this.props.ghost4!);
    pacman.position.set(new Vec3(0, 1000, 0));
    ghosts.forEach((suit:Entity)=>{
      suit.position.set(new Vec3(0, 500, 0));
    });
  }
  private pacmanInvincible = false;
  loseLife(){
    if(!this.pacmanInvincible){
      this.pacmanInvincible = true;
      this.async.setTimeout((()=>{this.pacmanInvincible = false}), 1000 * pacmanInvinsiblityTime);
      this.lives -= 1;
      if (this.lives === 0) {
        // TODO GHOSTS WIN!
        this.world.ui.showPopupForEveryone("Ghosts Win!", 3);
        this.changeGameState(GameState.Ending);
      } else {
        // respawn pacman
        // console.log("Event is being sent to pacman to respawn")
        this.sendNetworkEvent(this.props.pacMan!, Events.respawnPacman, {});
      }
    }
  }

  registerPacDot(pacDot: Entity) {
    this.allPacDots.set(pacDot.id, pacDot);
    // console.log(this.allPacDots.size + " PacDots registered");
  }
  eatPacDot(pacDot: Entity) {
    this.remainingPacDots.delete(pacDot.id);
    this.checkRemainingPacDots();
  }
  checkRemainingPacDots() {
    if (this.remainingPacDots.size === 0) {
      this.world.ui.showPopupForEveryone("Pacman Wins!", 3);
      this.changeGameState(GameState.Ending);
    }
  }
  powerPelletCollected(){
    // console.log('Pacman ate a PowerPellet')
    this.sendNetworkEvent(this.props.ghost1!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost2!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost3!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost4!, Events.makeGhostEdible, {});
  }
  updateQueue1ReadyState(isReady: boolean) {
    this.queue1Ready = isReady;
    // if (isReady) {
    //   console.log("Queue 1 is ready");
    // }else {
    //   console.log("Queue 1 is not ready");
    // }
  }
  updateQueue2ReadyState(isReady: boolean) {
    this.queue2Ready = isReady;
    if (isReady) {
      // console.log("Queue 2 is ready");
    }else {
      // console.log("Queue 2 is not ready");
    }
  }
}
Component.register(GameManager);