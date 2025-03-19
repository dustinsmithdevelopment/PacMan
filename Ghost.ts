import {AttachableEntity, Component, Player, World} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";

class Ghost extends Component {
  static propsDefinition = {};

  private attachedPlayer: Player|null = null;
  private motionActive = false;

  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.touchedByPacman.bind(this));
    this.connectNetworkEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
    this.connectNetworkEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
    this.connectLocalBroadcastEvent(World.onUpdate, this.enactMotion.bind(this));
    this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
    this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
  }
  start() {

  }
  touchedByPacman() {

  }

  startConstantMotion() {
    this.motionActive = true;
  }
  stopConstantMotion() {
    this.motionActive = false;
  }
  enactMotion(){
    if (this.motionActive) {
      if (this.attachedPlayer != null) {
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