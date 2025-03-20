import {
    AttachableEntity,
    Component,
    EventSubscription,
    Player,
    PropTypes,
    SerializableState,
    Vec3,
    World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";

export abstract class PlayerRole extends Component {
    protected attachedPlayer: Player|null = null;
    private motionActive = false;

    preStart() {
        this.connectNetworkEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
        this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
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
                this.attachedPlayer.velocity.set(new Vec3(playerTorsoDirection.get().x, 0, playerTorsoDirection.get().z).mul(movementSpeed));
            }
        }
    }
    private assignToPlayer(player: Player) {
        this.attachedPlayer = player;
        // this.attachedPlayer?.locomotionSpeed.set(0);
        // this.attachedPlayer.gravity.set(0);
        this.entity.as(AttachableEntity).attachToPlayer(player, anchorBodyPart);
        this.entity.owner.set(player);
    }
    private removeFromPlayer(player: Player) {
        this.stopConstantMotion();
        // this.attachedPlayer?.locomotionSpeed.set(4.5);
        // this.attachedPlayer?.gravity.set(9.81);
        this.entity.as(AttachableEntity).detach();
        this.attachedPlayer = null;
        this.entity.owner.set(this.world.getServerPlayer());

    }
    protected getAttachedPlayer(): Player | null {
        return this.attachedPlayer ?? null;
    }
    transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
        return {attachedPlayer: this.attachedPlayer, motionActive: this.motionActive};
    }
    receiveOwnership( state: {attachedPlayer: Player, motionActive: boolean}, _oldOwner: Player, _newOwner: Player) {
        this.attachedPlayer = state?.attachedPlayer;
        this.motionActive = state?.motionActive;
    }

}