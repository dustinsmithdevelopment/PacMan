import {Component, PropTypes} from "horizon/core";
import {Bindable, Binding, ImageSource, Text, UIComponent, UINode, View} from "horizon/ui";
import {Events, PlayerAssignment, PlayerRoles} from "./GameUtilities";

enum RoleValues {
    Dragon,
    Drone,
    None
}

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

    private playersInGameNames: string[] = new Array(5).fill("- - - -");
    private playersInGameDisplayValues: Binding<string[]> = new Binding(this.playersInGameNames);
    private playerColorBinding: Binding<string[]> = new Binding(new Array(5).fill("white"));

    static propsDefinition = {};

    initializeUI(): UINode {
        return View({
            children: [
                View({children: [
                        Text({text: "Players in current game:", style: {...textProperties}}),
                        View({style : {height: 40}}),
                        this.displayNode(0),
                        this.displayNode(1),
                        this.displayNode(2),
                        this.displayNode(3),
                        this.displayNode(4),
                    ], style: {display: "flex", flexDirection: "column", width: "100%"}}),
            ], style:{display: "flex", flexDirection: "row", backgroundColor: "black", width:"100%"}
        });
    }
    preStart() {
        this.connectLocalEvent(this.entity, Events.notifyCurrentGamePlayers, (payload: {currentGamePlayers: PlayerAssignment[]})=>{
            this.updateQueueDisplays(payload.currentGamePlayers);
        });
        this.connectNetworkBroadcastEvent(Events.resetGame, ()=>{
            this.updateQueueDisplays([]);
        });
    }

    start() {

    }
    private updateQueueDisplays(currentGamePlayers: PlayerAssignment[]) {
        const newColors = new Array(5).fill("white");
        for (let i = 0; i < 5; i++) {
            this.playersInGameNames[i] = currentGamePlayers[i]?.name ?? "- - - -";
            if (currentGamePlayers[i]?.role === PlayerRoles.Dragon) {newColors[i] = "blue";}
            if (currentGamePlayers[i]?.role === PlayerRoles.Drone) {newColors[i] = "red";}
        }
        this.playersInGameDisplayValues.set(this.playersInGameNames);
        this.playerColorBinding.set(newColors);

    }
    private displayNode(position: number): UINode{

        return View({children: [
                Text({text: this.playersInGameDisplayValues.derive((value)=>{return value[position]}), style: {...textProperties, color: this.playerColorBinding.derive((value)=>{return value[position]})}}),
            ], style: {flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}});


    }

}

Component.register(PlayerDisplay);