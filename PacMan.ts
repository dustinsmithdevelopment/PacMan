import {
  AttachableEntity,
  AttachablePlayerAnchor,
  CodeBlockEvents,
  Component,
  Entity, PhysicalEntity,
  Player, PropTypes,
  World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";

class PacMan extends Component {
  static propsDefinition = {
    CollectionTrigger: {type: PropTypes.Entity},
  };

  private attachedPlayer: Player|null = null;
  private motionActive = false;

  preStart() {
    this.connectNetworkEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
    this.connectNetworkEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
    this.connectLocalBroadcastEvent(World.onUpdate, this.enactMotion.bind(this));
    this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
    this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
  }

  start() {
    this.connectCodeBlockEvent(this.props.CollectionTrigger, CodeBlockEvents.OnEntityEnterTrigger, (item: Entity) => {this.itemTouched(item);});

  }
  itemTouched(item: Entity){
    this.sendLocalEvent(item, Events.touchedByPacman, {});
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
    console.log("received assignPlayer with ", player + ". Name: " + player.name.get(), " ID: " + player.id.valueOf());
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
Component.register(PacMan);