import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes} from "horizon/core";
import {Events, GamePlayers, PlayerList} from "./GameUtilities";

class PlayerManager extends Component<typeof PlayerManager> {
    static propsDefinition = {
        gameManager: {type: PropTypes.Entity, required: true},
        pacman: {type: PropTypes.Entity, required: true},
        ghost1: {type: PropTypes.Entity, required: true},
        ghost2: {type: PropTypes.Entity, required: true},
        ghost3: {type: PropTypes.Entity, required: true},
        ghost4: {type: PropTypes.Entity, required: true},
    };

    private gamePlayers: GamePlayers = new GamePlayers();
    private queue1Ready: boolean = false;
    private queue2Ready: boolean = false;

    preStart() {
        this.connectNetworkEvent(this.entity, Events.joinQueue1, (payload: {player: Player}) => {this.onJoinQueue1(payload.player);});
        this.connectNetworkEvent(this.entity, Events.joinQueue2, (payload: {player: Player}) => {this.onJoinQueue2(payload.player);});
        this.connectNetworkEvent(this.entity, Events.startPlayerAssignment, this.assignPlayers.bind(this));
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
        console.log(p.name.get() + " Requested to join queue 1");
        this.gamePlayers.moveToQueue1(p);
        this.queue1Ready = this.gamePlayers.queue1Full();
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue1ReadyState, {ready: this.queue1Ready});
    }
    onJoinQueue2(p: Player){
        console.log(p.name.get() + " Requested to join queue 2");
        this.gamePlayers.moveToQueue2(p);
        this.queue2Ready = this.gamePlayers.queue2Full();
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue2ReadyState, {ready: this.queue2Ready});
    }
    assignPlayers(){
        let nextMatchPlayers: Player[] = [];
        if (this.queue1Ready) {
            nextMatchPlayers = [...this.gamePlayers.queue1.players];
            this.gamePlayers.queue1.players = [...this.gamePlayers.queue2.players];
            this.gamePlayers.queue2.players = []
        }else if (this.queue2Ready) {
            nextMatchPlayers = [...this.gamePlayers.queue2.players];
            this.gamePlayers.queue2.players = []
        }
        const pacPlayer = Math.floor(Math.random()*5)
        for (let i = 0; i < 5; i++) {
            if (i === pacPlayer) {
                this.gamePlayers.makePacman(nextMatchPlayers[pacPlayer]);
            }else {
                this.gamePlayers.makeGhost(nextMatchPlayers[i]);
            }
        }
        this.suitUp();
    }
    suitUp() {
        const pacman = this.gamePlayers.pacman!;
        console.log("Pacman: " + pacman);
        const ghost1 = this.gamePlayers.ghosts.players[0];
        console.log("Ghost1: " + ghost1);
        const ghost2 = this.gamePlayers.ghosts.players[1];
        console.log("Ghost2: " + ghost2);
        const ghost3 = this.gamePlayers.ghosts.players[2];
        console.log("Ghost3: " + ghost3);
        const ghost4 = this.gamePlayers.ghosts.players[3];
        console.log("Ghost4: " + ghost4);
        this.sendNetworkEvent(this.props.pacman!, Events.assignPlayer, {player: pacman});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost1!, Events.assignPlayer, {player: ghost1});},100);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost2!, Events.assignPlayer, {player: ghost2});},200);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost3!, Events.assignPlayer, {player: ghost3});},300);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost4!, Events.assignPlayer, {player: ghost4});},400);
    }
}
Component.register(PlayerManager);
