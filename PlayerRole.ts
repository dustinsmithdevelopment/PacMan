import {AttachableEntity, Component, EventSubscription, Player, World} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";

export abstract class PlayerRole extends Component {
    private attachedPlayer: Player|null = null;
    private motionActive = false;

    preStart() {
        this.connectNetworkEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
        this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
        this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
    }
    private worldUpdate:number|null = null;
    private startConstantMotion() {
        this.motionActive = true;
        console.log("Starting Constant Motion");
        this.worldUpdate = this.async.setInterval(this.enactMotion.bind(this), 16);
    }
    private stopConstantMotion() {
        this.motionActive = false;
        console.log("Stopping Constant Motion");
        if (this.worldUpdate) {
            this.async.clearInterval(this.worldUpdate);
            this.worldUpdate = null;
        }
    }
    private enactMotion(){
        console.log("Calling Enact Motion: " + this.attachedPlayer?.name.get());
        if (this.motionActive) {
            if (this.attachedPlayer !== null) {
                console.log("Moving " + this.attachedPlayer.name.get());
                this.attachedPlayer.velocity.set(this.attachedPlayer.torso.forward.get().mul(movementSpeed));
            }
        }
    }
    private assignToPlayer(player: Player) {
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

}