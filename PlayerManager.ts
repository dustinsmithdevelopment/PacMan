import {
    AttachableEntity,
    AudioGizmo,
    CodeBlockEvents,
    Component,
    Entity,
    Player,
    PlayerDeviceType,
    PropTypes,
    SpawnPointGizmo,
    Vec3
} from "horizon/core";
import {
    EDIBLE_SECONDS,
    Events,
    GamePlayers,
    LOBBY_SCALE,
    MazeRunnerVariable,
    PlayerAssignment,
    PlayerRoles
} from "./GameUtilities";
import {CameraMode} from "horizon/camera";
import {PlayerCameraEvents} from "./PlayerCamera";

class PlayerManager extends Component<typeof PlayerManager> {
    static propsDefinition = {
        gameManager: {type: PropTypes.Entity, required: true},
        currentGamePlayersDisplay: {type: PropTypes.Entity, required: true},
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
        this.connectNetworkEvent(this.entity, Events.gameEnding, this.handleGameEnd.bind(this));
        this.connectNetworkBroadcastEvent(Events.powerPelletCollected, this.playPowerPelletMusic.bind(this));
        this.connectLocalEvent(this.entity, Events.ghostWin, this.addGhostWin.bind(this));
        this.connectLocalEvent(this.entity, Events.dragonWin, this.addDragonWin.bind(this));
        this.connectNetworkBroadcastEvent(Events.resetGame, this.resetGame.bind(this));
    }

    start() {
        this.lobbySpawn = this.props.lobbySpawnGizmo!.as(SpawnPointGizmo);
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => {this.onPlayerEnterWorld(player);});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerExitWorld, (player: Player) => {this.onPlayerExitWorld(player);});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterAFK, (player: Player) => {this.onPlayerExitWorld(player, true);});

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
        this.async.setInterval(this.updatePlayerTime.bind(this), 1000*60);

    }
    updatePlayerTime(){
        const worldVariables = this.world.persistentStorage;
        const worldLeaderboards = this.world.leaderboards;
        this.world.getPlayers().forEach(player => {
            if (player.deviceType.get() === PlayerDeviceType.VR){
                const newVRTime = 1 + worldVariables.getPlayerVariable(player, MazeRunnerVariable("vrtimeSpent"));
                worldVariables.setPlayerVariable(player,  MazeRunnerVariable("vrtimeSpent"), newVRTime);
                worldLeaderboards.setScoreForPlayer("TimeSpent", player, newVRTime, true);
            }

            if (player.deviceType.get() === PlayerDeviceType.Mobile){
                const newMobileTime = 1 + worldVariables.getPlayerVariable(player, MazeRunnerVariable("mobiletimeSpent"));
                worldVariables.setPlayerVariable(player,  MazeRunnerVariable("mobiletimeSpent"), newMobileTime);
                worldLeaderboards.setScoreForPlayer("MobileTimeSpent", player, newMobileTime, true);
            }

        });
    }
    onPlayerEnterWorld(p: Player){
        this.gamePlayers.moveToLobby(p);
        p.avatarScale.set(LOBBY_SCALE);
        this.lobbyAudio?.play({players: [p], fade:0});
    }
    onPlayerExitWorld(p: Player, afk:Boolean = false){
        if (p.id === this.pacman?.id){
            this.pacman = undefined;
            this.props.pacman!.owner.set(this.world.getServerPlayer());
            this.props.pacman!.position.set(new Vec3(1000,0,0));
            this.sendNetworkEvent(this.props.gameManager!, Events.pacmanDead, {});
        }
        if (p.id === this.ghost1?.id){
            this.ghost1 = undefined;
            this.props.ghost1!.owner.set(this.world.getServerPlayer());
            this.props.ghost1!.position.set(new Vec3(500,0,0));
        }
        if (p.id === this.ghost2?.id){
            this.ghost2 = undefined;
            this.props.ghost2!.owner.set(this.world.getServerPlayer());
            this.props.ghost2!.position.set(new Vec3(500,0,0));

        }
        if (p.id === this.ghost3?.id){
            this.ghost3 = undefined;
            this.props.ghost3!.owner.set(this.world.getServerPlayer());
            this.props.ghost3!.position.set(new Vec3(500,0,0));
        }
        if (p.id === this.ghost4?.id){
            this.ghost4 = undefined;
            this.props.ghost4!.owner.set(this.world.getServerPlayer());
            this.props.ghost4!.position.set(new Vec3(500,0,0));
        }
        this.gamePlayers.removePlayer(p);
        if (afk){
            p.avatarScale.set(LOBBY_SCALE);
            p.gravity.set(9.81);
            this.gamePlayers.moveToLobby(p);
        }
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
        // console.log("Assigning Players");
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
            this.lobbyAudio?.stop({players: [...nextMatchPlayers], fade: 0.1});
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
        this.sendNetworkBroadcastEvent(Events.setPacman, {pacMan: this.pacman});
        // console.log("Pacman",this.pacman.name.get());
        this.ghost1 = this.gamePlayers.ghosts.players[0];
        // console.log("Ghost1",this.ghost1.name.get());
        this.ghost2 = this.gamePlayers.ghosts.players[1] ?? undefined;
        // console.log("Ghost2",this.ghost2.name.get());
        this.ghost3 = this.gamePlayers.ghosts.players[2] ?? undefined;
        // console.log("Ghost3",this.ghost3.name.get());
        this.ghost4 = this.gamePlayers.ghosts.players[3] ?? undefined;

        const DisplayGamePlayers: PlayerAssignment[] = [];
        DisplayGamePlayers.push({name: this.pacman.name.get(), role: PlayerRoles.Dragon});
        DisplayGamePlayers.push({name: this.ghost1.name.get(), role: PlayerRoles.Drone});
        if (this.ghost2) DisplayGamePlayers.push({name: this.ghost2.name.get(), role: PlayerRoles.Drone});
        if (this.ghost3) DisplayGamePlayers.push({name: this.ghost3.name.get(), role: PlayerRoles.Drone});
        if (this.ghost4) DisplayGamePlayers.push({name: this.ghost4.name.get(), role: PlayerRoles.Drone});

        this.sendLocalEvent(this.props.currentGamePlayersDisplay!, Events.notifyCurrentGamePlayers, {currentGamePlayers: DisplayGamePlayers});





        // console.log("Ghost4",this.ghost4.name.get());
        this.pacman.position.set(new Vec3(0, -250, 0));
        this.async.setTimeout(()=>{
            this.props.pacman!.as(AttachableEntity).owner.set(this.pacman!);
            this.props.ghost1!.as(AttachableEntity).owner.set(this.ghost1!);
            this.ghost2 && this.props.ghost2!.as(AttachableEntity).owner.set(this.ghost2!);
            this.ghost3 && this.props.ghost3!.as(AttachableEntity).owner.set(this.ghost3!);
            this.ghost4 && this.props.ghost4!.as(AttachableEntity).owner.set(this.ghost4!);
            },500);

        this.async.setTimeout(()=>{
            this.sendNetworkEvent(this.props.gameManager!, Events.roleAssignmentComplete, {});
    });
    }
    handleGameEnd (){
        const playersInLastGame: Player[] = [];
        this.pacman && playersInLastGame.push(this.pacman);
        this.ghost1 && playersInLastGame.push(this.ghost1);
        this.ghost2 && playersInLastGame.push(this.ghost2);
        this.ghost3 && playersInLastGame.push(this.ghost3);
        this.ghost4 && playersInLastGame.push(this.ghost4);

        const worldVariables = this.world.persistentStorage;
        const worldLeaderboards = this.world.leaderboards;
        playersInLastGame.forEach((p: Player) => {

            const newDragonWins = 1 + worldVariables.getPlayerVariable(p, MazeRunnerVariable("gamesPlayed"));
            worldVariables.setPlayerVariable(p,  MazeRunnerVariable("gamesPlayed"), newDragonWins);
            worldLeaderboards.setScoreForPlayer("GamesPlayed", p, newDragonWins, true);
        })


        this.props.pacman!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.props.ghost1!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.ghost2 && this.props.ghost2!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.ghost3 && this.props.ghost3!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.ghost4 && this.props.ghost4!.as(AttachableEntity).owner.set(this.world.getServerPlayer());
        this.async.setTimeout(()=>{
            if (this.pacman){
                this.lobbySpawn?.teleportPlayer(this.pacman!);
                this.pacman!.avatarScale.set(LOBBY_SCALE);
                this.pacman!.gravity.set(9.81);
                this.gamePlayers.moveToLobby(this.pacman!);
            }
        },150);
        this.async.setTimeout(()=>{
            if (this.ghost1){
                this.lobbySpawn?.teleportPlayer(this.ghost1!);
                this.ghost1!.avatarScale.set(LOBBY_SCALE);
                this.ghost1!.gravity.set(9.81);
                this.gamePlayers.moveToLobby(this.ghost1!);
            }
            },250);
        this.async.setTimeout(()=>{
            if (this.ghost2) {
                this.lobbySpawn?.teleportPlayer(this.ghost2!);
                this.ghost2!.avatarScale.set(LOBBY_SCALE);
                this.ghost2!.gravity.set(9.81);
                this.gamePlayers.moveToLobby(this.ghost2!);
            }
            },350);
        this.async.setTimeout(()=>{
            if (this.ghost3) {
                this.lobbySpawn?.teleportPlayer(this.ghost3!);
                this.ghost3!.avatarScale.set(LOBBY_SCALE);
                this.ghost3!.gravity.set(9.81);
                this.gamePlayers.moveToLobby(this.ghost3!);
            }
            },450);
        this.async.setTimeout(()=>{
            if (this.ghost4) {
                this.lobbySpawn?.teleportPlayer(this.ghost4!);
                this.ghost4!.avatarScale.set(LOBBY_SCALE);
                this.ghost4!.gravity.set(9.81);
                this.gamePlayers.moveToLobby(this.ghost4!);
            }
            },550);
        this.async.setTimeout(()=>{
            this.gameAudio?.stop({players: this.currentGamePlayers, fade: 0.1});
            this.powerPelletAudio?.stop({players: this.currentGamePlayers, fade: 0.1});
            this.lobbyAudio?.play({players: this.currentGamePlayers, fade: 0.1});
            this.currentGamePlayers = [];
            this.playersAssigned = false;
            },600);

    }
    playPowerPelletMusic(){
        this.gameAudio?.stop({players: this.currentGamePlayers, fade: 0.1});
        this.powerPelletAudio?.play({players: this.currentGamePlayers, fade: 0.1});
        this.async.setTimeout(()=>{
            this.powerPelletAudio?.stop({players: this.currentGamePlayers, fade: 0.1});
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



    addDragonWin(){
        const dragonPlayer = this.pacman!;
        // console.log("adding a win for", dragonPlayer.name.get());

        const worldVariables = this.world.persistentStorage;
        const worldLeaderboards = this.world.leaderboards;
        const newDragonWins = 1 + worldVariables.getPlayerVariable(dragonPlayer, MazeRunnerVariable("dragonWins"));
        worldVariables.setPlayerVariable(dragonPlayer,  MazeRunnerVariable("dragonWins"), newDragonWins);
        worldLeaderboards.setScoreForPlayer("DragonWins", dragonPlayer, newDragonWins, true);


        const newTotalWins = 1 + worldVariables.getPlayerVariable(dragonPlayer, MazeRunnerVariable("totalWins"));
        worldVariables.setPlayerVariable(dragonPlayer,  MazeRunnerVariable("totalWins"), newTotalWins);
        worldLeaderboards.setScoreForPlayer("TotalWins", dragonPlayer, newTotalWins, true);
    }
    addGhostWin(){
        const drones: Player[] = [];
        this.ghost1 && drones.push(this.ghost1);
        this.ghost2 && drones.push(this.ghost2);
        this.ghost3 && drones.push(this.ghost3);
        this.ghost4 && drones.push(this.ghost4);

        // console.log("adding a win for", drones.length, "drones");
            const worldVariables = this.world.persistentStorage;
            const worldLeaderboards = this.world.leaderboards;
        drones.forEach(drone => {
            const newDroneWins = 1 + worldVariables.getPlayerVariable(drone, MazeRunnerVariable("droneWins"));
            worldVariables.setPlayerVariable(drone,  MazeRunnerVariable("droneWins"), newDroneWins);
            worldLeaderboards.setScoreForPlayer("DroneWin", drone, newDroneWins, true);

            const newTotalWins = 1 + worldVariables.getPlayerVariable(drone, MazeRunnerVariable("totalWins"));
            worldVariables.setPlayerVariable(drone,  MazeRunnerVariable("totalWins"), newTotalWins);
            worldLeaderboards.setScoreForPlayer("TotalWins", drone, newTotalWins, true);


        })

    }
    resetGame(){
        this.pacman = undefined;
        this.ghost1 = undefined;
        this.ghost2 = undefined;
        this.ghost3 = undefined;
        this.ghost4 = undefined;
    }
}
Component.register(PlayerManager);
