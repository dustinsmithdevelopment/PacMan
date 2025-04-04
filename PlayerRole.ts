import {
    AttachableEntity,
    Component,
    Entity,
    Player,
    PlayerVisibilityMode,
    SerializableState,
    SpawnPointGizmo,
    Vec3
} from "horizon/core";
import {anchorBodyPart, Events, GAME_SCALE, movementSpeed} from "./GameUtilities";
import {RestrictedRotation} from "./RestrictedRotation";

export abstract class PlayerRole extends RestrictedRotation {
    protected attachedPlayer: Player|null = null;
    private motionActive = false;
    private spawnPointGizmo: SpawnPointGizmo| undefined;
    private role = "";

    preStart() {
        super.preStart();
        this.connectNetworkEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
        this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
        this.connectNetworkBroadcastEvent(Events.moveAllToStart, this.moveToStart.bind(this));
    }
    private worldUpdate:number|null = null;
    protected setRole(role: string){
        this.role = role;
    }
    protected startConstantMotion() {
        this.motionActive = true;
        console.log("Starting Constant Motion");
        this.worldUpdate = this.async.setInterval(this.enactMotion.bind(this), 16);
    }
    protected stopConstantMotion() {
        this.motionActive = false;
        console.log("Stopping Constant Motion");
        if (this.worldUpdate) {
            this.async.clearInterval(this.worldUpdate);
            this.worldUpdate = null;
        }
    }
    private enactMotion(){
        if (this.motionActive) {
            if (this.attachedPlayer !== null) {
                const playerTorsoDirection = this.attachedPlayer.torso.forward;
                //TODO
                this.attachedPlayer.velocity.set(new Vec3(playerTorsoDirection.get().x, 0, playerTorsoDirection.get().z).mul(movementSpeed));
            }
        }
    }
    protected SetSpawnPoint(spawnEntity: Entity): void {
        this.spawnPointGizmo = spawnEntity.as(SpawnPointGizmo);
    }
    protected moveToStart(){
        console.log("Move To Start", this.spawnPointGizmo, this.attachedPlayer);
        this.attachedPlayer!.avatarScale.set(GAME_SCALE);
        this.async.setTimeout(()=>{this.spawnPointGizmo!.teleportPlayer(this.attachedPlayer!);},100);

    }
    private assignToPlayer(player: Player) {
        this.entity.owner.set(player);
        super.restrictRotation(player);
        console.log("Assigning Player", player);
        this.attachedPlayer = player;
        this.entity.as(AttachableEntity).attachToPlayer(player, anchorBodyPart);
        this.entity.setVisibilityForPlayers([player], PlayerVisibilityMode.HiddenFrom);
        this.world.ui.showPopupForPlayer(player, "You are " + this.role, 5);
    }
    private removeFromPlayer(player: Player) {
        this.stopConstantMotion();
        super.unrestrictRotation(player);
        this.entity.as(AttachableEntity).detach();
        this.attachedPlayer = null;
        this.entity.setVisibilityForPlayers([player], PlayerVisibilityMode.VisibleTo);
        this.entity.owner.set(this.world.getServerPlayer());
    }
    protected getAttachedPlayer(): Player | null {
        return this.attachedPlayer ?? null;
    }
    transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
        return {
            // attachedPlayer: this.attachedPlayer,
            // motionActive: this.motionActive,
            spawnPointGizmo: this.spawnPointGizmo!.as(Entity)};
    }
    receiveOwnership( state: {
        // attachedPlayer: Player,
        // motionActive: boolean,
        spawnPointGizmo: SpawnPointGizmo}, _oldOwner: Player, _newOwner: Player) {
        // this.attachedPlayer = state?.attachedPlayer;
        // this.motionActive = state?.motionActive;
        this.spawnPointGizmo = state?.spawnPointGizmo.as(SpawnPointGizmo);
    }

}