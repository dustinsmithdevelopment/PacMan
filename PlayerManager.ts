import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes} from "horizon/core";
import {Events, GamePlayers, PlayerList} from "./GameUtilities";

class PlayerManager extends Component<typeof PlayerManager> {
    static propsDefinition = {
        gameManager: {type: PropTypes.Entity}
    };

    private gamePlayers: GamePlayers = new GamePlayers();
    private queue1ReadyState: boolean = false;
    private queue2ReadyState: boolean = false;

    preStart() {
        this.connectNetworkEvent(this.entity, Events.joinQueue1, (payload: {player: Player}) => {this.onJoinQueue1(payload.player);});
        this.connectNetworkEvent(this.entity, Events.joinQueue2, (payload: {player: Player}) => {this.onJoinQueue2(payload.player);});
    }

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
    onJoinQueue1(p: Player){
        this.gamePlayers.moveToQueue1(p);
        this.queue1ReadyState = this.gamePlayers.queue1Full();
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue1ReadyState, {ready: this.queue1ReadyState});
    }
    onJoinQueue2(p: Player){
        this.gamePlayers.moveToQueue2(p);
        this.queue2ReadyState = this.gamePlayers.queue2Full();
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue2ReadyState, {ready: this.queue2ReadyState});
    }
}
Component.register(PlayerManager);
