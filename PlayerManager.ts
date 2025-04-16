import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes, SpawnPointGizmo} from "horizon/core";
import {Events, GamePlayers, playerCount, PlayerList, LOBBY_SCALE, GAME_SCALE} from "./GameUtilities";
import {Camera} from "horizon/camera";

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
        this.connectNetworkEvent(this.entity, Events.leaveQueue1, (payload: {player: Player})=> {this.onLeaveQueue1(payload.player);});
        this.connectNetworkEvent(this.entity, Events.leaveQueue2, (payload: {player: Player})=> {this.onLeaveQueue2(payload.player);});
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
        this.lobbySpawn?.teleportPlayer(p);
        p.avatarScale.set(LOBBY_SCALE);
    }
    onPlayerExitWorld(p: Player){
        if (this.gamePlayers.isPacman(p)){
            this.sendLocalBroadcastEvent(Events.pacmanDead, {});
        }
        this.gamePlayers.removePlayer(p)
    }
    onJoinQueue1(p: Player){
        this.gamePlayers.moveToQueue1(p);
        this.queue1Ready = this.gamePlayers.queue1Full();
        this.updateQueueStates();
    }
    onLeaveQueue1(p: Player){
        if (this.gamePlayers.queue1.players.includes(p)){
            this.gamePlayers.moveToLobby(p);
        }
        this.updateQueueStates();
    }
    onJoinQueue2(p: Player){
        this.gamePlayers.moveToQueue2(p);
        this.queue2Ready = this.gamePlayers.queue2Full();
        this.updateQueueStates();
    }
    onLeaveQueue2(p: Player){
        if (this.gamePlayers.queue2.players.includes(p)){
            this.gamePlayers.moveToLobby(p);
        }
        this.updateQueueStates();
    }
    private playersAssigned = false;
    assignPlayers(){
        console.log("Assigning Players");
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
                    this.gamePlayers.makePacman(nextMatchPlayers[i]);
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
    private ghost3:Player|undefined;
    private ghost4:Player|undefined;
    suitUp() {
        // suit up requested
        this.pacman = this.gamePlayers.pacman!;
        console.log("Pacman",this.pacman.name.get());
        this.ghost1 = this.gamePlayers.ghosts.players[0];
        console.log("Ghost1",this.ghost1.name.get());
        this.ghost2 = this.gamePlayers.ghosts.players[1];
        console.log("Ghost2",this.ghost2.name.get());
        this.ghost3 = this.gamePlayers.ghosts.players[2];
        console.log("Ghost3",this.ghost3.name.get());
        this.ghost4 = this.gamePlayers.ghosts.players[3];
        console.log("Ghost4",this.ghost4.name.get());
        this.sendNetworkEvent(this.props.pacman!, Events.assignPlayer, {player: this.pacman});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost1!, Events.assignPlayer, {player: this.ghost1!});},200);
        // this.sendNetworkEvent(this.props.ghost1!, Events.assignPlayer, {player: this.ghost1!});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost2!, Events.assignPlayer, {player: this.ghost2!});},400);
        // this.sendNetworkEvent(this.props.ghost2!, Events.assignPlayer, {player: this.ghost2!});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost3!, Events.assignPlayer, {player: this.ghost3!});},600);
        // this.sendNetworkEvent(this.props.ghost3!, Events.assignPlayer, {player: this.ghost3!});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost4!, Events.assignPlayer, {player: this.ghost4!});},800);
        // this.sendNetworkEvent(this.props.ghost4!, Events.assignPlayer, {player: this.ghost4!});
        this.async.setTimeout(()=>{this.moveGamePlayersToStart()}, 2_000);
    }
    moveGamePlayersToStart(){
        this.sendNetworkEvent(this.props.pacman! ,Events.moveToStart, {});
        this.sendNetworkEvent(this.props.ghost1! ,Events.moveToStart, {});
        this.sendNetworkEvent(this.props.ghost2! ,Events.moveToStart, {});
        this.sendNetworkEvent(this.props.ghost3! ,Events.moveToStart, {});
        this.sendNetworkEvent(this.props.ghost4! ,Events.moveToStart, {});
        this.sendNetworkEvent(this.props.gameManager!, Events.roleAssignmentComplete, {});
    }
    returnGamePlayersToLobby (player: Player){
        this.sendNetworkEvent(this.props.pacman!, Events.unassignPlayer, {});
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost1!, Events.unassignPlayer, {});},200);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost2!, Events.unassignPlayer, {});},400);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost3!, Events.unassignPlayer, {});},600);
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.ghost4!, Events.unassignPlayer, {});},800);
        this.async.setTimeout(()=>{
            this.lobbySpawn?.teleportPlayer(this.pacman!);
            this.pacman!.avatarScale.set(LOBBY_SCALE);
        },150);
        this.async.setTimeout(()=>{
            this.lobbySpawn?.teleportPlayer(this.ghost1!);
            this.ghost1!.avatarScale.set(LOBBY_SCALE);
            },250);
        this.async.setTimeout(()=>{
            this.lobbySpawn?.teleportPlayer(this.ghost2!);
            this.ghost2!.avatarScale.set(LOBBY_SCALE);
            },350);
        this.async.setTimeout(()=>{
            this.lobbySpawn?.teleportPlayer(this.ghost3!);
            this.ghost3!.avatarScale.set(LOBBY_SCALE);
            },450);
        this.async.setTimeout(()=>{
            this.lobbySpawn?.teleportPlayer(this.ghost4!);
            this.ghost4!.avatarScale.set(LOBBY_SCALE);
            },550);
        this.async.setTimeout(()=>{this.playersAssigned = false;},600);

    }
    updateQueueStates(){
        this.queue1Ready = this.gamePlayers.queue1Full();
        this.queue2Ready = this.gamePlayers.queue2Full();
        this.sendNetworkBroadcastEvent(Events.updatePlayersInQueue, {queue1: this.gamePlayers.queue1.players, queue2: this.gamePlayers.queue2.players})
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue1ReadyState, {ready: this.queue1Ready});
        this.sendNetworkEvent(this.props.gameManager!, Events.setQueue2ReadyState, {ready: this.queue2Ready});
    }
}
Component.register(PlayerManager);
