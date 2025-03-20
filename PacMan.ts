import {
  AttachableEntity,
  CodeBlockEvents,
  Component,
  Entity,
  EventSubscription,
  Player,
  PropTypes,
  World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {
    collectionTrigger: {type: PropTypes.Entity}
  };

  preStart() {
    super.preStart();
  }
  start() {
    this.connectCodeBlockEvent(this.props.collectionTrigger, CodeBlockEvents.OnEntityEnterTrigger, (entity: Entity)=>{
      this.itemTouched(entity);
    })
  }
  itemTouched(item: Entity){
    console.log("itemTouched", item.name.get());
    this.sendNetworkEvent(item, Events.touchedByPacman, {});
  }

}
Component.register(PacMan);