import {Player, CodeBlockEvents, Color, PropTypes, Vec3, World, Entity} from "horizon/core"
import {Pressable, UIComponent, UINode, Text, Binding} from "horizon/ui"
import {Events, GameState} from "./GameUtilities";

const textFormatting = {fontSize: 3, backgroundColor: Color.black, fontColor: Color.white, showTimer: false, playSound: false};
class StartNowButton extends UIComponent<typeof StartNowButton> {
  panelWidth = 1000;
  panelHeight = 1000;
  static propsDefinition = {
    GameManager: {type: PropTypes.Entity},
    objectToMove: { type: PropTypes.Entity },
    offset: { type: PropTypes.Vec3 },
  };
  private initialPosition!: Vec3;
  private queuePlayers: Player[] = [];
  private enoughPlayers: boolean = false;
  private onCoolDown: boolean = false;
  private gameInProgress: boolean = false;

  private coolDownTimeout: number|null = null;

  private buttonDisplayText: "Waiting"|"Not Enough Players"|"Game In Progress"|"Start Now" = "Waiting";
  private buttonText: Binding<string> = new Binding<string>(this.buttonDisplayText);
  private objectToMove!: Entity;

  preStart() {
    this.connectNetworkBroadcastEvent(Events.updatePlayersInQueue, (payload: {queue1: Player[], queue2: Player[]})=>{
      this.queuePlayers = payload.queue1;
      this.enoughPlayers = (payload.queue1.length >= 2);
      this.updateButtonStatus();
    });
    this.connectNetworkBroadcastEvent(Events.changeGameState, (payload: {state: GameState})=>{
      this.gameInProgress = !(payload.state === GameState.Waiting);
      this.updateButtonStatus();
    });
    this.connectNetworkBroadcastEvent(Events.resetGame, this.startCoolDown.bind(this));
  }
  start() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, ()=>{
      this.startCoolDown();
    });
    this.startCoolDown();
    this.objectToMove = this.props.objectToMove!;
    this.initialPosition = this.objectToMove.position.get();
  }
  initializeUI(): UINode {
    return Pressable({children: [
        Text({
          text: this.buttonText,
          style: {width: '100%', height: '100%', textAlign: 'center', textAlignVertical: 'center', color: 'white', fontSize: 128, fontWeight: "bold"}})
      ], style: {width: 1000, height: 1000, borderRadius: 500},
         onClick:(p: Player)=>{this.handleButtonPress(p)}});
  }
  moveOverTime(start: Vec3, end: Vec3, duration: number): void {
    const startTime = Date.now();
    const motion=  this.connectLocalBroadcastEvent(World.onUpdate, (data: {deltaTime: number}) => this.update(data.deltaTime, start, end, startTime, duration));
    this.async.setTimeout(()=>{motion.disconnect();},100+1000*duration);
  }
  update(deltaTime: number, startPosition: Vec3, targetPosition: Vec3, startTime: number, duration: number): void {
    const timeElapsed = (Date.now() - startTime) / 1000;
    if (timeElapsed >= duration!) return;

    const percentComplete = timeElapsed / duration!;
    const currentPosition = Vec3.lerp(startPosition, targetPosition, percentComplete);
    this.objectToMove.position.set(currentPosition);
  }
  private showingAnimation = false;
  handleButtonPress(p: Player){
    // TODO START
    if(!this.showingAnimation){
      this.showingAnimation = true;
      const duration = 1_000;
      const targetPosition = this.initialPosition.add(this.props.offset);
      this.moveOverTime(this.initialPosition, targetPosition, duration);
      this.async.setTimeout(()=>{this.moveOverTime(targetPosition, this.initialPosition, 1)},duration + 100);
      this.async.setTimeout(()=>{this.showingAnimation = false;},duration * 2 + 100);
    }
    // TODO END
    if (this.queuePlayers.includes(p)){
      switch (this.buttonDisplayText) {
        case "Waiting":
          this.world.ui.showPopupForPlayer(p, "Please give other players time to join", 3, {...textFormatting});
          break;
        case "Not Enough Players":
          this.world.ui.showPopupForPlayer(p, "At least 2 players are required to start", 3, {...textFormatting});
          break;
        case "Game In Progress":
          this.world.ui.showPopupForPlayer(p, "A game is still in progress", 3, {...textFormatting});
          break;
        case "Start Now":
          this.sendNetworkEvent(this.props.GameManager!, Events.startNow, {});
          break;
      }
    }else{
      this.world.ui.showPopupForPlayer(p, "You are not in the next game", 3, {...textFormatting});
    }
  }

  updateButtonStatus(){

    if (this.gameInProgress) this.buttonDisplayText = "Game In Progress";
    else if (!this.enoughPlayers) this.buttonDisplayText = "Not Enough Players";
    else if (this.onCoolDown) this.buttonDisplayText = "Waiting";
    else this.buttonDisplayText = "Start Now";

    this.buttonText.set(this.buttonDisplayText);
  }
  startCoolDown() {
    this.coolDownTimeout && this.async.clearTimeout(this.coolDownTimeout);
    this.onCoolDown = true;
    this.updateButtonStatus();
    this.coolDownTimeout = this.async.setTimeout(()=>{
      this.onCoolDown = false;
      this.updateButtonStatus();
      this.coolDownTimeout = null;
    }, 10_000);

  }
}
UIComponent.register(StartNowButton);