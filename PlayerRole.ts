import {
    AttachableEntity,
    Component, Entity,
    EventSubscription,
    Player,
    PropTypes,
    SerializableState, SpawnPointGizmo,
    Vec3,
    World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";

export abstract class PlayerRole extends Component {
    protected attachedPlayer: Player|null = null;
    private motionActive = false;
    private spawnPointGizmo: SpawnPointGizmo| undefined;

    preStart() {
        this.connectNetworkEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
        this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
        this.connectNetworkBroadcastEvent(Events.moveAllToStart, this.moveToStart.bind(this));
    }
    private worldUpdate:number|null = null;
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
        this.spawnPointGizmo!.teleportPlayer(this.attachedPlayer!);
    }
    private assignToPlayer(player: Player) {
        console.log("Assigning Player", player);
        this.attachedPlayer = player;
        this.entity.as(AttachableEntity).attachToPlayer(player, anchorBodyPart);
        this.entity.owner.set(player);
    }
    private removeFromPlayer(player: Player) {
        this.stopConstantMotion();
        this.entity.as(AttachableEntity).detach();
        this.attachedPlayer = null;
        this.entity.owner.set(this.world.getServerPlayer());

    }
    protected getAttachedPlayer(): Player | null {
        return this.attachedPlayer ?? null;
    }
    transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
        return {attachedPlayer: this.attachedPlayer, motionActive: this.motionActive, spawnPointGizmo: this.spawnPointGizmo!.as(Entity)};
    }
    receiveOwnership( state: {attachedPlayer: Player, motionActive: boolean, spawnPointGizmo: SpawnPointGizmo}, _oldOwner: Player, _newOwner: Player) {
        this.attachedPlayer = state?.attachedPlayer;
        this.motionActive = state?.motionActive;
        this.spawnPointGizmo = state?.spawnPointGizmo.as(SpawnPointGizmo);
    }

}