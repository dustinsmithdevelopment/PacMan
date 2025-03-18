import {
  AttachableEntity,
  AttachablePlayerAnchor,
  CodeBlockEvents,
  Component,
  Entity, PhysicalEntity,
  Player,
  World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";

class PacMan extends Component {
  static propsDefinition = {
    CollectionTrigger: {type: Entity},
  };

  private attachedPlayer: Player|null = null;
  private motionActive = false;

  preStart() {
    this.connectLocalEvent(this.entity, Events.startConstantMotion, this.startConstantMotion.bind(this));
    this.connectLocalEvent(this.entity, Events.stopConstantMotion, this.stopConstantMotion.bind(this));
    this.connectLocalBroadcastEvent(World.onUpdate, this.enactMotion.bind(this));
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