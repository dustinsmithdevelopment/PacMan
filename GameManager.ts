import {
  AudioGizmo,
  Color,
  Component,
  DynamicLightGizmo,
  Entity,
  ParticleGizmo,
  Player,
  PropTypes,
  Vec3
} from "horizon/core";
import {
  DOTS_TO_SHOW_FRUIT,
  EDIBLE_SECONDS,
  Events,
  GAME_MINUTES,
  gameCheckFrequencySecs,
  GameState, MazeRunnerVariable,
  pacmanInvinsiblityTime,
  setupDelaySecs
} from "./GameUtilities";

enum WinnerTypes {
  "Dragon",
  "Drones"
}

class GameManager extends Component<typeof GameManager> {
  static propsDefinition = {
    PlayerManager : {type: PropTypes.Entity, required: true},
    pacMan: {type: PropTypes.Entity, required: true},
    ghost1: {type: PropTypes.Entity, required: true},
    ghost2: {type: PropTypes.Entity, required: true},
    ghost3: {type: PropTypes.Entity, required: true},
    ghost4: {type: PropTypes.Entity, required: true},
    confetti: {type: PropTypes.Entity, required: true},
    endGameSound: {type: PropTypes.Entity, required: true},
    flashingLight: {type: PropTypes.Entity, required: true},

  };
  private confetti!: ParticleGizmo;
  private currentPacman: Player|undefined;
  private currentGameState: GameState = GameState.Waiting;
  private queue1Ready = false;
  private queue2Ready = false;
  private points = 0;
  private lives = 3;
  private allPacDots: Map<bigint, Entity> = new Map<bigint, Entity>();
  private remainingPacDots: Map<bigint, Entity> = new Map();
  private queue1PlayerCount = 0;
  private gameTimer = -1;
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
    this.connectNetworkBroadcastEvent(Events.fruitCollected, (payload: {points: number})=>{
      this.collectFruit(payload.points);
    });
    this.connectNetworkBroadcastEvent(Events.setPacman, (payload: {pacMan: Player})=>{this.currentPacman = payload.pacMan});
    this.connectNetworkEvent(this.entity, Events.pacmanDead, this.pacmanInstantLoss.bind(this));
    this.connectNetworkEvent(this.entity, Events.addPointsToPlayer, (payload: {player: Player, points: number})=>{
      this.addPointsToPlayer(payload.player, payload.points);
    });
  }

  start() {
    this.async.setTimeout(()=>{
      this.async.setInterval(this.checkIfReadyToStart.bind(this), 1000*gameCheckFrequencySecs)
    }, 1000*setupDelaySecs);
    this.confetti = this.props.confetti!.as(ParticleGizmo);
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
    // console.log("Attempting to force start the game")
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
          if (this.currentGameState === GameState.Waiting){
            this.prepareGame();
          }
          break;
        case GameState.Playing:
        if (this.currentGameState === GameState.Starting){
          this.startGame();
        }
          break;
        case GameState.Ending:
          if (this.currentGameState === GameState.Playing){
            this.endGame();
          }
      }
      this.sendNetworkBroadcastEvent(Events.changeGameState, {state: this.currentGameState});
    }
  }

  prepareGame() {
    this.pacmanInvincible = true;
    this.currentGameState = GameState.Starting;
    this.remainingPacDots = new Map(this.allPacDots);
    this.lives = 3;
    this.sendNetworkEvent(this.props.PlayerManager!, Events.startPlayerAssignment, {force: (!(this.queue1PlayerCount >= 5))});
  }
  startGame() {
    this.pacmanInvincible = false;
    // console.log("Changing Game State to Playing");
    this.currentGameState = GameState.Playing;
    this.gameTimer = this.async.setTimeout(()=>{
      this.announceEndGame(WinnerTypes.Drones);
    },GAME_MINUTES*60*1000);

  }
  endGame() {
    this.pacmanInvincible = true;
    if (this.currentPacman){
      const worldVariables = this.world.persistentStorage;
      const worldLeaderboards = this.world.leaderboards;
      const newScore = this.points + worldVariables.getPlayerVariable(this.currentPacman, MazeRunnerVariable("Points"));
      worldVariables.setPlayerVariable(this.currentPacman,  MazeRunnerVariable("Points"), newScore);
      worldLeaderboards.setScoreForPlayer("Points", this.currentPacman, newScore, true);
    }
    this.points = 0;
    // console.log("Changing Game State to Ending");
    this.currentGameState = GameState.Ending;
    this.sendNetworkEvent(this.props.PlayerManager!, Events.gameEnding, {});
    this.async.clearTimeout(this.gameTimer);
    this.async.setTimeout(()=>{this.changeGameState(GameState.Waiting)}, 5_000)
  }
  resetGame(){
    // console.log("Changing Game State to Waiting");
    this.currentPacman = undefined;
    this.points = 0;
    this.currentGameState = GameState.Waiting;
    // console.log("Sending Game Reset")
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
        this.announceEndGame(WinnerTypes.Drones);
      } else {
        // respawn pacman
        // console.log("Event is being sent to pacman to respawn")
        this.sendNetworkBroadcastEvent(Events.respawnPacman, {});
      }
    }
  }
  pacmanInstantLoss(){
    if(this.currentGameState === GameState.Playing)this.announceEndGame(WinnerTypes.Drones);
  }

  registerPacDot(pacDot: Entity) {
    this.allPacDots.set(pacDot.id, pacDot);
    // console.log(this.allPacDots.size + " PacDots registered");
  }
  eatPacDot(pacDot: Entity) {
    this.remainingPacDots.delete(pacDot.id);
    this.points += 10;
    this.checkRemainingPacDots();
    // console.log((this.allPacDots.size - this.remainingPacDots.size));
    // console.log("Is equal:", (this.allPacDots.size - this.remainingPacDots.size) == DOTS_TO_SHOW_FRUIT);
    // console.log(DOTS_TO_SHOW_FRUIT);
    if ((this.allPacDots.size - this.remainingPacDots.size) == DOTS_TO_SHOW_FRUIT){
      // console.log("Making Fruit Visible")
      this.sendNetworkBroadcastEvent(Events.fruitCollectable, {});
    }
  }
  checkRemainingPacDots() {
    if (this.remainingPacDots.size === 0) {
      this.announceEndGame(WinnerTypes.Dragon);
    }
  }
  powerPelletCollected(){
    // console.log('Pacman ate a PowerPellet')
    this.sendNetworkEvent(this.props.ghost1!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost2!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost3!, Events.makeGhostEdible, {});
    this.sendNetworkEvent(this.props.ghost4!, Events.makeGhostEdible, {});
    this.flashBlueLight();
  }
  flashBlueLight(){
    let on = false;
    const flashValue = this.async.setInterval(()=>{
      on = !on;
      this.props.flashingLight?.as(DynamicLightGizmo).enabled.set(on);
    },250);
    this.async.setTimeout(()=>{
      this.async.clearInterval(flashValue);
      this.props.flashingLight?.as(DynamicLightGizmo).enabled.set(false);
    },1000*EDIBLE_SECONDS);

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
  collectFruit(points: number){
    this.points += points;
  }

  announceEndGame(winner: WinnerTypes){
    switch (winner){
      case WinnerTypes.Dragon:
        this.sendLocalEvent(this.props.PlayerManager!, Events.dragonWin, {});
        break;
      case WinnerTypes.Drones:
        this.sendLocalEvent(this.props.PlayerManager!, Events.ghostWin, {});
        break;
    }
    this.world.ui.showPopupForEveryone("Game Over", 3, {backgroundColor: Color.black, fontColor: Color.red, fontSize: 5, showTimer: false, playSound: false});
    this.confetti.play();
    this.props.endGameSound?.as(AudioGizmo).play();
    this.async.setTimeout(()=>{
      switch (winner){
        case WinnerTypes.Dragon:
          this.world.ui.showPopupForEveryone("The Dragon Wins!", 3);
          break;
        case WinnerTypes.Drones:
          this.world.ui.showPopupForEveryone("Drones Win!", 3);
          break;
      }
      this.changeGameState(GameState.Ending);
    }, 3_000);

  }
  addPointsToPlayer(p: Player,pointsToAdd: number){
    const worldVariables = this.world.persistentStorage;
    const worldLeaderboards = this.world.leaderboards;
    const newScore = pointsToAdd + worldVariables.getPlayerVariable(p, MazeRunnerVariable("Points"));
    worldVariables.setPlayerVariable(p,  MazeRunnerVariable("Points"), newScore);
    worldLeaderboards.setScoreForPlayer("Points", p, newScore, true);
  }
}
Component.register(GameManager);