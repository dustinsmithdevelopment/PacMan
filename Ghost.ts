import {AttachableEntity, Component, EventSubscription, Player, World} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class Ghost extends PlayerRole {
  static propsDefinition = {};

  preStart() {
    super.preStart();
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.touchedByPacman.bind(this));
  }
  start() {

  }
  touchedByPacman() {

  }

}
Component.register(Ghost);