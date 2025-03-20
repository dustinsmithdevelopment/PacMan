import {
  AttachableEntity,
  Component,
  Entity,
  EventSubscription,
  Player,
  PropTypes,
  Quaternion,
  Vec3,
  World
} from "horizon/core";
import {anchorBodyPart, Events, movementSpeed} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";
enum GhostState{
  enemy,
  edible
}

class Ghost extends PlayerRole {
  static propsDefinition = {
    homePositionRef: {type: PropTypes.Entity},
    manager: {type: PropTypes.Entity},
  };
  private ghostState: GhostState = GhostState.enemy;
  private homePosition: Vec3|undefined;
  private homeRotation: Quaternion|undefined;

  preStart() {
    super.preStart();
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.touchedByPacman.bind(this));
  }
  start() {
    // @ts-ignore
    this.homePosition = this.props.homePositionRef!.position.get();
    // @ts-ignore
    this.homeRotation = this.props.homePositionRef!.rotation.get();
  }
  touchedByPacman() {
    switch (this.ghostState){
      case GhostState.enemy:
        this.attackPacman();
        break;
      case GhostState.edible:
        this.eatenByPacman()
        break;
    }
  }
  attackPacman(){
    this.sendNetworkEvent(this.props.manager!, Events.ghostCaughtPacman, {});
  }
  eatenByPacman(){
    this.respawn();
  }
  respawn(){
    // super.stopConstantMotion();
    super.getAttachedPlayer()?.position.set(this.homePosition!);
    super.getAttachedPlayer()?.rootRotation.set(this.homeRotation!);
    this.ghostState = GhostState.enemy;
    // super.startConstantMotion();
  }

}
Component.register(Ghost);