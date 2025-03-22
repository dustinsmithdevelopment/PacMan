import {
  AttachableEntity,
  CodeBlockEvents,
  Component,
  Entity,
  EventSubscription,
  Player,
  PropTypes, Quaternion, Vec3,
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
  private homeRotation: Quaternion|undefined;

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
  moveToStart(){
    super.getAttachedPlayer()?.position.set(this.homePosition!);
    super.getAttachedPlayer()?.rootRotation.set(this.homeRotation!);
  }
  itemTouched(item: Entity){
    // console.log("itemTouched", item.name.get());
    this.sendNetworkEvent(item, Events.touchedByPacman, {});
  }
  respawn(){
    super.stopConstantMotion();
    this.moveToStart();
    super.startConstantMotion();
  }

}
Component.register(PacMan);