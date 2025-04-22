import {Player, CodeBlockEvents} from "horizon/core"
import {Pressable, View, UIComponent, UINode, Text, Binding} from "horizon/ui"
import {Events, GameState} from "./GameUtilities";

class StartNowButton extends UIComponent<typeof StartNowButton> {
  panelWidth = 1000;
  panelHeight = 1000;
  static propsDefinition = {};

  private enoughPlayers: boolean = false;
  private onCoolDown: boolean = false;
  private gameInProgress: boolean = false;

  private coolDownTimeout: number|null = null;

  private buttonText: Binding<string> = new Binding<string>("Test Text");

  preStart() {
    this.connectLocalBroadcastEvent(Events.updatePlayersInQueue, (payload: {queue1: Player[], queue2: Player[]})=>{
      this.enoughPlayers = (payload.queue1.length >= 2);
      this.updateButtonText();
    });
    this.connectLocalBroadcastEvent(Events.changeGameState, (payload: {state: GameState})=>{
      this.gameInProgress = !(payload.state === GameState.Waiting);
      this.updateButtonText();
    });
  }
  initializeUI(): UINode {
    return Pressable({children: [
        Text({text: this.buttonText, style: {width: '100%', height: '100%', textAlign: 'center', textAlignVertical: 'center', color: 'white', fontSize: 128, fontWeight: "bold"}},)
      ], style: {backgroundColor: "black", width: 1000, height: 1000, borderRadius: 500}});
  }

  updateButtonText(){
    let buttonDisplayText: string;

    if (this.gameInProgress) buttonDisplayText = "Game In Progress";
    else if (!this.enoughPlayers) buttonDisplayText = "Not enough players";
    else if (this.onCoolDown) buttonDisplayText = "Waiting";
    else buttonDisplayText = "Start Now";

    this.buttonText.set(buttonDisplayText);
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
    this.updateButtonText();
    this.coolDownTimeout = this.async.setTimeout(()=>{
      this.onCoolDown = false;
      this.updateButtonText();
      this.coolDownTimeout = null;
    }, 10_000);

  }
}
UIComponent.register(StartNowButton);