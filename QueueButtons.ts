import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes} from "horizon/core";
import {Events, GamePlayers, PlayerList} from "./GameUtilities";
import {Pressable, Text, UIComponent, UINode, View} from "horizon/ui";

class QueueButtons extends UIComponent {
    static propsDefinition = {
        playerManager: {type: PropTypes.Entity}
    };
    initializeUI(): UINode {
        const width = 120;
        const height = 100;
        return View({children:
                [
                    Pressable({children:
                        Text({text: "JoinQueue1", style: {color: "white", textAlign: "center", textAlignVertical: "center", height: "50%"}}), onClick: (player: Player) => {
                    this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue1, {player: player});
                    }}),
                    Pressable({children:
                        Text({text: "JoinQueue1", style: {color: "white", textAlign: "center", textAlignVertical: "center", height: "50%"}}), onClick: (player: Player) => {
                        this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue2, {player: player});
                    }}),
                ], style: {backgroundColor:"black", width: width, height: height, display: "flex", justifyContent: "center", flexDirection: "column"}
        })
    }

    start() {
    }
}
Component.register(QueueButtons);
