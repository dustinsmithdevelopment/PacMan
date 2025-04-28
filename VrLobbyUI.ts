import {Component, Player, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";
import {Binding, Pressable, Text, UIComponent, UINode, View} from "horizon/ui";


class PlayerScreen extends UIComponent {
    panelWidth = 800;
    panelHeight = 300;
    private queue1: Player[] = [];
    private queue2: Player[] = [];

    private queue1Binding: Binding<string> = new Binding("Join Next Game");
    private queue2Binding: Binding<string> = new Binding("Join Queue 2");





    static propsDefinition = {
        playerManager: {type: PropTypes.Entity},
    };
    initializeUI(): UINode {
        return View({children:[
                Pressable({style: {backgroundColor: "#455A64", borderRadius: 12, borderColor: "black", borderWidth: 4, height: 300}, onClick: (player: Player)=>{
                        if (!this.queue1.includes(player)) {
                            this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue1, {player: player});
                        }else {
                            this.sendNetworkEvent(this.props.playerManager!, Events.leaveQueue1, {player: player});
                        }
                    }, children: [
                        Text({text: this.queue1Binding, style: {color: "#00BCD4", height: "100%", textAlign: "center", textAlignVertical: "center", fontSize: 100, fontWeight: "bold"}},)
                    ]})
            ], style: {position: "absolute",width: "100%", height: "100%", left: 0, top: 0, display: "flex", flexDirection: "column", justifyContent: "space-between"}});
    }



    preStart() {
        this.connectNetworkBroadcastEvent(Events.updatePlayersInQueue, (payload: {queue1: Player[], queue2: Player[]}) => {
            this.queue1 = payload.queue1;
            this.queue2 = payload.queue2;
            this.updatePlayerStatuses(payload.queue1, payload.queue2);
        });
    }
    start() {}

    private updatePlayerStatuses(queue1: Player[], queue2: Player[]): void {
        this.world.getPlayers().forEach((p: Player) => {
           let queue1display: string;
            let queue2display: string;
           if (queue1.includes(p)){
               queue1display = "Leave Next Game";
           }
           else if (queue1.length >= 5){
               queue1display = "Next Game Full";
           } else {
               queue1display = "Join Next Game";
           }

            if (queue2.includes(p)){
                queue2display = "Leave Queue 2";
            }
            else if (queue2.length >= 5){
                queue2display = "Queue 2 Full";
            } else {
                queue2display = "Join Queue 2";
            }
            this.queue1Binding.set(queue1display, [p]);
            this.queue2Binding.set(queue2display, [p]);
        });
    }












}
Component.register(PlayerScreen);