import {
  AttachableEntity,
  CodeBlockEvents,
  Component,
  Entity,
  EventSubscription,
  Player,
  PropTypes, Vec3,
  World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {
    homePositionRef: {type: PropTypes.Entity},
    collectionTrigger: {type: PropTypes.Entity},
    manager: {type: PropTypes.Entity},
  };
  private homePosition: Vec3|undefined;

  preStart() {
    super.preStart();
  }
  start() {
    this.connectCodeBlockEvent(this.props.collectionTrigger, CodeBlockEvents.OnEntityEnterTrigger, (entity: Entity)=>{
      this.itemTouched(entity);
    });
    // @ts-ignore
    this.homePosition = this.props.homePositionRef!.position.get();
  }
  itemTouched(item: Entity){
    console.log("itemTouched", item.name.get());
    this.sendNetworkEvent(item, Events.touchedByPacman, {});
  }

}
Component.register(PacMan);