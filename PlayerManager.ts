import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes, SpawnPointGizmo} from "horizon/core";
import {Events, GamePlayers, playerCount, PlayerList} from "./GameUtilities";

class PlayerManager extends Component<typeof PlayerManager> {
    static propsDefinition = {
        gameManager: {type: PropTypes.Entity, required: true},
        pacman: {type: PropTypes.Entity, required: true},
        ghost1: {type: PropTypes.Entity, required: true},
        ghost2: {type: PropTypes.Entity, required: true},
        ghost3: {type: PropTypes.Entity, required: true},
        ghost4: {type: PropTypes.Entity, required: true},
        lobbySpawnGizmo: {type: PropTypes.Entity, required: true},
    };

    private lobbySpawn: SpawnPointGizmo|undefined;
    private gamePlayers: GamePlayers = new GamePlayers();
    private queue1Ready: boolean = false;
    private queue2Ready: boolean = false;

    preStart() {
        this.connectNetworkEvent(this.entity, Events.joinQueue1, (payload: {player: Player}) => {this.onJoinQueue1(payload.player);});
        this.connectNetworkEvent(this.entity, Events.joinQueue2, (payload: {player: Player}) => {this.onJoinQueue2(payload.player);});
        this.connectNetworkEvent(this.entity, Events.startPlayerAssignment, this.assignPlayers.bind(this));
        this.connectNetworkEvent(this.entity, Events.gameEnding, this.returnGamePlayersToLobby.bind(this));
    }

    start() {
        this.lobbySpawn = this.props.lobbySpawnGizmo!.as(SpawnPointGizmo);
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
    private playersAssigned = false;
    assignPlayers(){
        console.log("Something requested to assignPlayers");
        if (!this.playersAssigned) {
            this.playersAssigned = true;
            let nextMatchPlayers: Player[] = [];
            if (this.queue1Ready) {
                nextMatchPlayers = [...this.gamePlayers.queue1.players];
                this.gamePlayers.queue1.players = [...this.gamePlayers.queue2.players];
                this.gamePlayers.queue2.players = []
            } else if (this.queue2Ready) {
                nextMatchPlayers = [...this.gamePlayers.queue2.players];
                this.gamePlayers.queue2.players = []
            }
            this.updateQueueStates();
            const pacPlayer = Math.floor(Math.random() * playerCount)
            for (let i = 0; i < playerCount; i++) {
                if (i === pacPlayer) {
                    this.gamePlayers.makePacman(nextMatchPlayers[pacPlayer]);
                } else {
                    this.gamePlayers.makeGhost(nextMatchPlayers[i]);
                }
            }
            this.suitUp();
        }
    }
    private pacman:Player|undefined;
    private ghost1:Player|undefined;
    private ghost2:Player|undefined;
    // private ghost3:Player|undefined;
    // private ghost4:Player|undefined;
    suitUp() {
        // suit up requested
        this.pacman = this.gamePlayers.pacman!;
        this.ghost1 = this.gamePlayers.ghosts.players[0];
        this.ghost2 = this.gamePlayers.ghosts.players[1];
        // this.ghost3 = this.gamePlayers.ghosts.players[2];
        // this.ghost4 = this.gamePlayers.ghosts.players[3];
        this.sendNetworkEvent(this.props.pacman!, Events.assignPlayer, {player: this.pacman});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost1!, Events.assignPlayer, {player: this.ghost1!});},100);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost2!, Events.assignPlayer, {player: this.ghost2!});},200);
        // this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost3!, Events.assignPlayer, {player: this.ghost3!});},300);
        // this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost4!, Events.assignPlayer, {player: this.ghost4!});},400);
        this.async.setTimeout(()=>{this.moveGamePlayersToStart()}, 600);
    }
    moveGamePlayersToStart(){
        this.sendNetworkBroadcastEvent(Events.moveAllToStart, {})
        this.sendNetworkEvent(this.props.gameManager!, Events.roleAssignmentComplete, {});
    }
    returnGamePlayersToLobby (player: Player){
        this.sendNetworkEvent(this.props.pacman!, Events.unassignPlayer, {});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost1!, Events.unassignPlayer, {});},100);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost2!, Events.unassignPlayer, {});},200);
        // this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost3!, Events.unassignPlayer, {});},300);
        // this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost4!, Events.unassignPlayer, {});},400);
        this.async.setTimeout(()=>{this.lobbySpawn?.teleportPlayer(this.pacman!)},150);
        this.async.setTimeout(()=>{this.lobbySpawn?.teleportPlayer(this.ghost1!)},250);
        this.async.setTimeout(()=>{this.lobbySpawn?.teleportPlayer(this.ghost2!)},350);
        // this.async.setTimeout(()=>{this.lobbySpawn?.teleportPlayer(this.ghost3!)},450);
        // this.async.setTimeout(()=>{this.lobbySpawn?.teleportPlayer(this.ghost4!)},550);
        this.async.setTimeout(()=>{this.playersAssigned = false;},600);

    }
    updateQueueStates(){
        this.queue1Ready = this.gamePlayers.queue1Full();
        this.queue2Ready = this.gamePlayers.queue2Full();
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue1ReadyState, {ready: this.queue1Ready});
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue2ReadyState, {ready: this.queue2Ready});
    }
}
Component.register(PlayerManager);
