import {CodeBlockEvents, Component, Player} from "horizon/core";
import {UIComponent, UINode, View} from "horizon/ui";

class WaitingList extends UIComponent<typeof WaitingList> {
  static propsDefinition = {};
  private playersInTrigger: Player[] = [];

  initializeUI(): UINode {
    return View({});
  }
  preStart() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerExitWorld, (player: Player) => {this.playerLeftWold(player);});
  }

  start() {

  }
  addWaitingPlayer(player: Player){
    if (!this.playersInTrigger.includes(player)){
      this.playersInTrigger.push(player);
    }
  }
  removeWaitingPlayer(player: Player){
    if (this.playersInTrigger.includes(player)){
      this.playersInTrigger.splice(this.playersInTrigger.indexOf(player), 1);
    }
  }
  playerLeftWold(player: Player){
    this.removeWaitingPlayer(player);
  }
}
Component.register(WaitingList);