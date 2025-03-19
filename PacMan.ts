import {
  AttachableEntity,
  AttachablePlayerAnchor,
  CodeBlockEvents,
  Component,
  Entity, EventSubscription, PhysicalEntity,
  Player, PropTypes,
  World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {
    CollectionTrigger: {type: PropTypes.Entity},
  };

  preStart() {
    super.preStart();
  }
  start() {
    this.connectCodeBlockEvent(this.props.CollectionTrigger, CodeBlockEvents.OnEntityEnterTrigger, (item: Entity) => {this.itemTouched(item);});

  }
  itemTouched(item: Entity){
    this.sendLocalEvent(item, Events.touchedByPacman, {});
  }
}
Component.register(PacMan);