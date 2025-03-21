import {CodeBlockEvent, CodeBlockEvents, Component, Player} from "horizon/core";
import {Events, GamePlayers, PlayerList} from "./GameUtilities";

class PlayerManager extends Component<typeof PlayerManager> {
    static propsDefinition = {};

    private gamePlayers: GamePlayers = new GamePlayers();

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => {this.onPlayerEnterWorld(player);});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerExitWorld, (player: Player) => {this.onPlayerExitWorld(player);});
    }
    onPlayerEnterWorld(p: Player){
        this.gamePlayers.moveToLobby(p);
    }
    onPlayerExitWorld(p: Player){
        if (this.gamePlayers.isPacman(p)){
            this.sendLocalBroadcastEvent(Events.pacmanDead, {});
        }
        this.gamePlayers.removePlayer(p)
    }
}
Component.register(PlayerManager);
