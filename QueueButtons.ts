import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes} from "horizon/core";
import {Events, GamePlayers, PlayerList} from "./GameUtilities";
import {Pressable, Text, UIComponent, UINode, View} from "horizon/ui";

class QueueButtons extends UIComponent {
    panelHeight = 100;
    panelWidth = 200;
    static propsDefinition = {
        playerManager: {type: PropTypes.Entity}
    };
    initializeUI(): UINode {
        return View({children:
                [
                    Pressable({children:
                        Text({text: "Join Queue 1", style: {color: "white", textAlign: "center", textAlignVertical: "center", height: "50%"}}), onClick: (player: Player) => {
                    this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue1, {player: player});
                    }}),
                    Pressable({children:
                        Text({text: "Join Queue 2", style: {color: "white", textAlign: "center", textAlignVertical: "center", height: "50%"}}), onClick: (player: Player) => {
                        this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue2, {player: player});
                    }}),
                ], style: {backgroundColor:"black", display: "flex", justifyContent: "center", flexDirection: "column"}
        })
    }

    start() {
    }
}
Component.register(QueueButtons);
