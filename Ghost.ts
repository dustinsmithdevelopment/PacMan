import {AttachableEntity, Component, EventSubscription, Player, World} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";

class Ghost extends Component {
  static propsDefinition = {};

  private attachedPlayer: Player|null = null;
  private motionActive = false;

  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.touchedByPacman.bind(this));
    this.connectNetworkEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
    this.connectNetworkEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
    this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
    this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
  }
  start() {

  }
  touchedByPacman() {

  }
  private worldUpdate: EventSubscription|undefined;
  startConstantMotion() {
    this.motionActive = true;
    console.log("Starting Constant Motion");
    this.worldUpdate = this.connectLocalBroadcastEvent(World.onUpdate, this.enactMotion.bind(this));
  }
  stopConstantMotion() {
    this.motionActive = false;
    console.log("Stopping Constant Motion");
    this.worldUpdate?.disconnect();
  }
  enactMotion(){
    if (this.motionActive) {
      if (this.attachedPlayer != null) {
        console.log("Moving " + this.attachedPlayer.name.get());
        this.attachedPlayer.velocity.set(this.attachedPlayer.torso.forward.get().mul(movementSpeed));
      }
    }
  }
  assignToPlayer(player: Player) {
    this.attachedPlayer = player;
    this.entity.as(AttachableEntity).attachToPlayer(player, anchorBodyPart);
    this.entity.owner.set(player);
  }
  removeFromPlayer(player: Player) {
    this.stopConstantMotion();
    this.entity.as(AttachableEntity).detach();
    this.attachedPlayer = null;
    this.entity.owner.set(this.world.getServerPlayer());

  }

}
Component.register(Ghost);