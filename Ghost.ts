import {Component, PropTypes,} from "horizon/core";
import {EDIBLE_SECONDS, Events} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";
enum GhostState{
  enemy,
  edible
}



class Ghost extends PlayerRole {
  private edibleCooldown: number|undefined;
  static propsDefinition = {
    homePositionSpawn: {type: PropTypes.Entity, required: true},
    manager: {type: PropTypes.Entity, required: true},
  };
  private ghostState: GhostState = GhostState.enemy;

  preStart() {
    super.preStart();
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.touchedByPacman.bind(this));
    this.connectNetworkEvent(this.entity, Events.makeGhostEdible, this.becomeEdible.bind(this));
  }
  start() {
    this.SetSpawnPoint(this.props.homePositionSpawn!);
  }
  touchedByPacman() {
    console.log("I'm a ghost and pacman touched me.")
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
    super.stopConstantMotion();
    if (this.edibleCooldown){
      this.async.clearInterval(this.edibleCooldown);
      this.edibleCooldown = undefined;
    }
    super.moveToStart();
    this.becomeEnemy();
    super.startConstantMotion();
  }
  becomeEdible(){
    this.ghostState = GhostState.edible;
    this.edibleCooldown = this.async.setTimeout(this.becomeEnemy.bind(this), EDIBLE_SECONDS*1000);
  }
  becomeEnemy(){
    this.edibleCooldown = undefined;
    this.ghostState = GhostState.enemy;
  }
  // TODO make ghosts flash blue while edible 

}
Component.register(Ghost);