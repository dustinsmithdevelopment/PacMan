import {Component, Player} from "horizon/core";
import {Binding, Text, UIComponent, UINode, View} from "horizon/ui";
import {Events} from "./GameUtilities";


class QueueDisplay extends UIComponent{
  panelWidth = 500;
  panelHeight= 800;
  private queue1: Player[] = [];
  private queue2: Player[] = [];

  private queue1DisplayValues: string[] = new Array(5).fill("None");
  private queue2DisplayValues: string[] = new Array(5).fill("None");

  private queue1DisplayBinding: Binding<string[]> = new Binding(Array());
  private queue2DisplayBinding: Binding<string[]> = new Binding(Array());

  static propsDefinition = {};

  initializeUI(): UINode {
    return View({
      children: [
          View({children: [
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[0]})}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[1]})}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[2]})}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[3]})}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[4]})}),
            ], style: {display: "flex", flexDirection: "column"}}),
          View({children: [
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[0]})}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[1]})}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[2]})}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[3]})}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[4]})}),
            ], style: {display: "flex", flexDirection: "column"}}),
      ], style:{display: "flex", flexDirection: "row"}
    });
  }
  preStart() {
    this.connectNetworkBroadcastEvent(Events.updatePlayersInQueue, (payload:{queue1: Player[], queue2: Player[]}) => {
      this.queue1 = [...payload.queue1];
      this.queue2 = [...payload.queue2];
      this.updateQueueDisplays();
    })
  }

  start() {

  }
  private updateQueueDisplays() {
    for (let i = 0; i <= 4; i++) {
      this.queue1DisplayValues[i] = this.queue1[i].name.get() ?? "None";
      this.queue2DisplayValues[i] = this.queue2[i].name.get() ?? "None";
    }
    this.queue1DisplayBinding.set(this.queue1DisplayValues);
    this.queue2DisplayBinding.set(this.queue2DisplayValues);

  }

}

Component.register(QueueDisplay);