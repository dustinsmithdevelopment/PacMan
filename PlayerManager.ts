import {
    AttachableEntity, AudioGizmo,
    CodeBlockEvent,
    CodeBlockEvents,
    Component, Entity,
    Player,
    PropTypes,
    SpawnPointGizmo
} from "horizon/core";
import {Events, GamePlayers, playerCount, PlayerList, LOBBY_SCALE, GAME_SCALE, EDIBLE_SECONDS} from "./GameUtilities";
import {Camera, CameraMode} from "horizon/camera";
import {PlayerCameraEvents} from "./PlayerCamera";

class PlayerManager extends Component<typeof PlayerManager> {
    static propsDefinition = {
        gameManager: {type: PropTypes.Entity, required: true},
        pacman: {type: PropTypes.Entity, required: true},
        ghost1: {type: PropTypes.Entity, required: true},
        ghost2: {type: PropTypes.Entity, required: true},
        ghost3: {type: PropTypes.Entity, required: true},
        ghost4: {type: PropTypes.Entity, required: true},
        lobbySpawnGizmo: {type: PropTypes.Entity, required: true},
        lobbyAudio: {type: PropTypes.Entity},
        gameAudio: {type: PropTypes.Entity},
        powerPelletAudio: {type: PropTypes.Entity},
    };

    private lobbySpawn: SpawnPointGizmo|undefined;
    private gamePlayers: GamePlayers = new GamePlayers();
    private queue1Ready: boolean = false;
    private queue2Ready: boolean = false;

    private currentGamePlayers: Player[] = [];

    private lobbyAudio: AudioGizmo|undefined;
    private gameAudio: AudioGizmo|undefined;
    private powerPelletAudio: AudioGizmo|undefined;

    preStart() {
        this.connectNetworkEvent(this.entity, Events.joinQueue1, (payload: {player: Player}) => {this.onJoinQueue1(payload.player);});
        this.connectNetworkEvent(this.entity, Events.joinQueue2, (payload: {player: Player}) => {this.onJoinQueue2(payload.player);});
        this.connectNetworkEvent(this.entity, Events.leaveQueue1, (payload: {player: Player})=> {this.onLeaveQueue1(payload.player);});
        this.connectNetworkEvent(this.entity, Events.leaveQueue2, (payload: {player: Player})=> {this.onLeaveQueue2(payload.player);});
        this.connectNetworkEvent(this.entity, Events.startPlayerAssignment, (payload: {force: boolean})=>{this.assignPlayers(payload.force);});
        this.connectNetworkEvent(this.entity, Events.gameEnding, this.returnGamePlayersToLobby.bind(this));
        this.connectNetworkBroadcastEvent(Events.powerPelletCollected, this.playPowerPelletMusic.bind(this));
    }

    start() {
        this.lobbySpawn = this.props.lobbySpawnGizmo!.as(SpawnPointGizmo);
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => {this.onPlayerEnterWorld(player);});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerExitWorld, (player: Player) => {this.onPlayerExitWorld(player);});

        const lobbyAudioEntity: Entity|undefined = this.props.lobbyAudio;
        const gameAudioEntity: Entity|undefined = this.props.gameAudio;
        const powerPelletAudioEntity: Entity|undefined = this.props.powerPelletAudio;

        if (lobbyAudioEntity) {
            this.lobbyAudio =  lobbyAudioEntity!.as(AudioGizmo);
        }
        if (gameAudioEntity) {
            this.gameAudio =  gameAudioEntity!.as(AudioGizmo);
        }
        if (powerPelletAudioEntity){
            this.powerPelletAudio =  powerPelletAudioEntity!.as(AudioGizmo);
        }
    }
    onPlayerEnterWorld(p: Player){
        this.gamePlayers.moveToLobby(p);
        // TODO ADD THIS BACK
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
    assignPlayers(force: boolean = false){
        console.log("Assigning Players");
        if (!this.playersAssigned) {
            this.playersAssigned = true;
            let nextMatchPlayers: Player[] = [];
            if (force || this.queue1Ready) {
                nextMatchPlayers = [...this.gamePlayers.queue1.players];
                this.gamePlayers.queue1.players = [...this.gamePlayers.queue2.players];
                this.gamePlayers.queue2.players = []
            } else if (this.queue2Ready) {
                nextMatchPlayers = [...this.gamePlayers.queue2.players];
                this.gamePlayers.queue2.players = []
            }
            this.currentGamePlayers = nextMatchPlayers;
            this.sendNetworkBroadcastEvent(Events.updateCurrentGamePlayers, {players: this.currentGamePlayers});
            nextMatchPlayers.forEach((p: Player) => {
                this.sendNetworkEvent(p, PlayerCameraEvents.SetCameraMode, {mode: CameraMode.FirstPerson});
            });
            this.lobbyAudio?.pause({players: [...nextMatchPlayers], fade: 0.1});
            this.gameAudio?.play({players: [...nextMatchPlayers], fade: 0.1});

            this.updateQueueStates();
            const pacPlayer = Math.floor(Math.random() * nextMatchPlayers.length);
            for (let i = 0; i < nextMatchPlayers.length; i++) {
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
        this.sendNetworkBroadcastEvent(Events.setPacman, {pacMan: this.gamePlayers.pacman!});
        // console.log("Pacman",this.pacman.name.get());
        this.ghost1 = this.gamePlayers.ghosts.players[0];
        // console.log("Ghost1",this.ghost1.name.get());
        this.ghost2 = this.gamePlayers.ghosts.players[1] ?? undefined;
        // console.log("Ghost2",this.ghost2.name.get());
        this.ghost3 = this.gamePlayers.ghosts.players[2] ?? undefined;
        // console.log("Ghost3",this.ghost3.name.get());
        this.ghost4 = this.gamePlayers.ghosts.players[3] ?? undefined;
        // console.log("Ghost4",this.ghost4.name.get());
        this.props.pacman!.as(AttachableEntity).owner.set(this.pacman);
        this.props.ghost1!.as(AttachableEntity).owner.set(this.ghost1);
        this.ghost2 && this.props.ghost2!.as(AttachableEntity).owner.set(this.ghost2);
        this.ghost2 && this.props.ghost3!.as(AttachableEntity).owner.set(this.ghost3);
        this.ghost2 && this.props.ghost4!.as(AttachableEntity).owner.set(this.ghost4);
        this.async.setTimeout(()=>{
            this.sendNetworkEvent(this.props.gameManager!, Events.roleAssignmentComplete, {});
    });
    }
    returnGamePlayersToLobby (player: Player){

        this.props.pacman!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.props.ghost1!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.ghost2 && this.props.ghost2!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.ghost3 && this.props.ghost3!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.ghost4 && this.props.ghost4!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.async.setTimeout(()=>{
            this.lobbySpawn?.teleportPlayer(this.pacman!);
            this.pacman!.avatarScale.set(LOBBY_SCALE);
        },150);
        this.async.setTimeout(()=>{
            this.lobbySpawn?.teleportPlayer(this.ghost1!);
            this.ghost1!.avatarScale.set(LOBBY_SCALE);
            },250);
        this.async.setTimeout(()=>{
            this.ghost2 && this.lobbySpawn?.teleportPlayer(this.ghost2!);
            this.ghost2 && this.ghost2!.avatarScale.set(LOBBY_SCALE);
            },350);
        this.async.setTimeout(()=>{
            this.ghost3 && this.lobbySpawn?.teleportPlayer(this.ghost3!);
            this.ghost3 && this.ghost3!.avatarScale.set(LOBBY_SCALE);
            },450);
        this.async.setTimeout(()=>{
            this.ghost4 && this.lobbySpawn?.teleportPlayer(this.ghost4!);
            this.ghost4 && this.ghost4!.avatarScale.set(LOBBY_SCALE);
            },550);
        this.async.setTimeout(()=>{
            this.gameAudio?.pause({players: this.currentGamePlayers, fade: 0.1});
            this.powerPelletAudio?.pause({players: this.currentGamePlayers, fade: 0.1});
            this.lobbyAudio?.play({players: this.currentGamePlayers, fade: 0.1});
            this.currentGamePlayers = [];
            this.playersAssigned = false;
            },600);

    }
    playPowerPelletMusic(){
        this.gameAudio?.pause({players: this.currentGamePlayers, fade: 0.1});
        this.powerPelletAudio?.play({players: this.currentGamePlayers, fade: 0.1});
        this.async.setTimeout(()=>{
            this.powerPelletAudio?.pause({players: this.currentGamePlayers, fade: 0.1});
            if (this.playersAssigned) {
                this.gameAudio?.play({players: this.currentGamePlayers, fade: 0.1});
            }

        }, EDIBLE_SECONDS*1_000);
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
