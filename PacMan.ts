import {Component, Entity,
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {};

  preStart() {
    super.preStart();
  }
  start() {
    // this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityCollision, (collidedWith: Entity)=>{this.itemTouched(collidedWith)});

  }
  itemTouched(item: Entity){
    this.sendLocalEvent(item, Events.touchedByPacman, {});
  }
}
Component.register(PacMan);