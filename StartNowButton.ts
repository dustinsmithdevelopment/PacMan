import {Player, CodeBlockEvents, Color, PropTypes} from "horizon/core"
import {Pressable, UIComponent, UINode, Text, Binding} from "horizon/ui"
import {Events, GameState} from "./GameUtilities";

const textFormatting = {fontSize: 3, backgroundColor: Color.black, fontColor: Color.white, showTimer: false, playSound: false};
class StartNowButton extends UIComponent<typeof StartNowButton> {
  panelWidth = 1000;
  panelHeight = 1000;
  static propsDefinition = {
    GameManager: {type: PropTypes.Entity},
  };

  private queuePlayers: Player[] = [];
  private enoughPlayers: boolean = false;
  private onCoolDown: boolean = false;
  private gameInProgress: boolean = false;

  private coolDownTimeout: number|null = null;

  private buttonDisplayText: "Waiting"|"Not Enough Players"|"Game In Progress"|"Start Now" = "Waiting";
  private buttonText: Binding<string> = new Binding<string>(this.buttonDisplayText);

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
  }
  initializeUI(): UINode {
    return Pressable({children: [
        Text({
          text: this.buttonText,
          style: {width: '100%', height: '100%', textAlign: 'center', textAlignVertical: 'center', color: 'white', fontSize: 128, fontWeight: "bold"}})
      ], style: {backgroundColor: "black", width: 1000, height: 1000, borderRadius: 500},
         onClick:(p: Player)=>{this.handleButtonPress(p)}});
  }
  handleButtonPress(p: Player){
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
  }

  updateButtonStatus(){

    if (this.gameInProgress) this.buttonDisplayText = "Game In Progress";
    else if (!this.enoughPlayers) this.buttonDisplayText = "Not Enough Players";
    else if (this.onCoolDown) this.buttonDisplayText = "Waiting";
    else this.buttonDisplayText = "Start Now";

    this.buttonText.set(this.buttonDisplayText);
  }
  start() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, ()=>{
      this.startCoolDown();
    });
    this.startCoolDown();
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