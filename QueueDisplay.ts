import {Color, Component, Player} from "horizon/core";
import {Bindable, Binding, Text, UIComponent, UINode, View} from "horizon/ui";
import {Events} from "./GameUtilities";

const textProperties = {
    fontSize:64,
    fontWeight:'bold' as Bindable<"bold" | "normal" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900">,
    textAlign:'center' as "center" | "auto" | "left" | "right" | undefined,
    marginTop: 50,
    marginBottom: 50,
    width: "100%",
}
class QueueDisplay extends UIComponent{
  panelWidth = 1000;
  panelHeight= 1200;
  private queue1: Player[] = [];
  private queue2: Player[] = [];

  private queue1DisplayValues: string[] = new Array(5).fill("None");
  private queue2DisplayValues: string[] = new Array(5).fill("None");

  private queue1DisplayBinding: Binding<string[]> = new Binding(this.queue1DisplayValues);
  private queue2DisplayBinding: Binding<string[]> = new Binding(this.queue2DisplayValues);

  static propsDefinition = {};

  initializeUI(): UINode {
      this.queue1DisplayBinding.set(this.queue1DisplayValues);
      this.queue2DisplayBinding.set(this.queue2DisplayValues);
    return View({
      children: [
          View({children: [
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[0]}), style: {...textProperties}}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[1]}), style: {...textProperties}}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[2]}), style: {...textProperties}}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[3]}), style: {...textProperties}}),
              Text({text: this.queue1DisplayBinding.derive((value)=>{return value[4]}), style: {...textProperties}}),
            ], style: {display: "flex", flexDirection: "column", width: "50%"}}),
          View({children: [
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[0]}), style: {...textProperties}}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[1]}), style: {...textProperties}}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[2]}), style: {...textProperties}}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[3]}), style: {...textProperties}}),
              Text({text: this.queue2DisplayBinding.derive((value)=>{return value[4]}), style: {...textProperties}}),
            ], style: {display: "flex", flexDirection: "column", width: "50%"}}),
      ], style:{display: "flex", flexDirection: "row", backgroundColor: "black", width:"100%"}
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