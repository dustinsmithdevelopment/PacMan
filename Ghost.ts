import {Color, Component, Entity, MeshEntity, PropTypes, Vec3,} from "horizon/core";
import {EDIBLE_SECONDS, Events} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";
enum GhostState{
  enemy,
  edible
}



class Ghost extends PlayerRole {
  private edibleCooldown: number|undefined;
  private blueFlash: number|undefined;
  static propsDefinition = {
    homePositionSpawn: {type: PropTypes.Entity, required: true},
    manager: {type: PropTypes.Entity, required: true},
  };
  private ghostState: GhostState = GhostState.enemy;
  private ghostMesh: MeshEntity|undefined;

  preStart() {
    super.preStart();
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.touchedByPacman.bind(this));
    this.connectNetworkEvent(this.entity, Events.makeGhostEdible, this.becomeEdible.bind(this));
    this.connectNetworkBroadcastEvent(Events.resetGame, this.becomeEnemy.bind(this));
  }
  start() {
    // TODO
    const homePositionSpawn: Entity = this.props.homePositionSpawn!
    super.SetHomePosition(homePositionSpawn);
    this.entity.position.set(new Vec3(0,1000, 0));
    this.ghostMesh = this.entity.as(MeshEntity);
    super.setRole("a drone");
  }
  touchedByPacman() {
    // console.log("I'm a ghost and pacman touched me.")
    switch (this.ghostState){
      case GhostState.enemy:
        this.attackPacman();
        break;
      case GhostState.edible:
        this.eatenByPacman();
        break;
    }
  }
  attackPacman(){
    this.sendNetworkEvent(this.props.manager!, Events.ghostCaughtPacman, {});
  }
  eatenByPacman(){
    this.respawn();
    this.sendNetworkEvent(this.props.manager!, Events.addPacmanPoints, {points: 200});
  }
  respawn(){
    super.moveToStart();
    this.becomeEnemy();
  }
  becomeEdible(){
    this.ghostState = GhostState.edible;
    this.edibleCooldown = this.async.setTimeout(this.becomeEnemy.bind(this), EDIBLE_SECONDS*1000);
    this.ghostMesh && this.ghostMesh.style.tintColor.set(Color.blue);
    this.blueFlash = this.async.setInterval(this.flashBlue.bind(this),250);
  }
  private blue = false;
  flashBlue(){
    if (this.ghostMesh){
      this.blue = !this.blue;
      if (this.blue) {
        this.ghostMesh.style.tintStrength.set(0);
      } else {
        this.ghostMesh.style.tintStrength.set(1);
      }
    }
  }
  becomeEnemy(){
    if (this.blueFlash){
      this.async.clearInterval(this.blueFlash);
      this.blueFlash = undefined;
    }
    this.async.setInterval(()=>{
      this.ghostMesh && this.ghostMesh.style.tintStrength.set(0);
    },250)
    if (this.edibleCooldown){
      this.async.clearInterval(this.edibleCooldown);
      this.edibleCooldown = undefined;
    }
    this.ghostState = GhostState.enemy;
  }

}
Component.register(Ghost);