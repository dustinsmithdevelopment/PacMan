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
class PlayerDisplay extends UIComponent{
    panelWidth = 800;
    panelHeight= 1200;
    private playersInGame: Player[] = [];

    private playersInGameNames: string[] = new Array(5).fill("- - - -");

    private playersInGameDisplayValues: Binding<string[]> = new Binding(this.playersInGameNames);

    static propsDefinition = {};

    initializeUI(): UINode {
        this.playersInGameDisplayValues.set(this.playersInGameNames);
        return View({
            children: [
                View({children: [
                        Text({text: "Players in current game:", style: {...textProperties}}),
                        View({style : {height: 40}}),
                        Text({text: this.playersInGameDisplayValues.derive((value)=>{return value[0]}), style: {...textProperties}}),
                        Text({text: this.playersInGameDisplayValues.derive((value)=>{return value[1]}), style: {...textProperties}}),
                        Text({text: this.playersInGameDisplayValues.derive((value)=>{return value[2]}), style: {...textProperties}}),
                        Text({text: this.playersInGameDisplayValues.derive((value)=>{return value[3]}), style: {...textProperties}}),
                        Text({text: this.playersInGameDisplayValues.derive((value)=>{return value[4]}), style: {...textProperties}}),
                    ], style: {display: "flex", flexDirection: "column", width: "100%"}}),
            ], style:{display: "flex", flexDirection: "row", backgroundColor: "black", width:"100%"}
        });
    }
    preStart() {
        this.connectNetworkBroadcastEvent(Events.updateCurrentGamePlayers, (payload: {players: Player[]})=>{
            this.playersInGame = payload.players;
        });
    }

    start() {

    }
    private updateQueueDisplays() {
        for (let i = 0; i <= 4; i++) {
            this.playersInGameNames[i] = this.playersInGame[i]?.name.get() ?? "- - - -";
        }
        this.playersInGameDisplayValues.set(this.playersInGameNames);

    }

}

Component.register(PlayerDisplay);