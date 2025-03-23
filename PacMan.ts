import {
  CodeBlockEvents, Component, Entity, PropTypes, SpawnPointGizmo,
} from "horizon/core";
import {Events} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {
    homePositionSpawn: {type: PropTypes.Entity, required: true},
    collectionTrigger: {type: PropTypes.Entity, required: true},
    manager: {type: PropTypes.Entity, required: true},
  };

  preStart() {
    super.preStart();
    this.connectNetworkEvent(this.entity, Events.teleportPacman, (payload: {spawnPoint: SpawnPointGizmo})=>{
      this.teleportPacman(payload.spawnPoint);
    });
    this.connectNetworkEvent(this.entity, Events.respawnPacman, ()=>{this.respawn();})
  }
  start() {
    this.connectCodeBlockEvent(this.props.collectionTrigger, CodeBlockEvents.OnEntityEnterTrigger, (entity: Entity)=>{
      this.itemTouched(entity);
    });
    this.SetSpawnPoint(this.props.homePositionSpawn!);
  }
  itemTouched(item: Entity){
    // console.log("itemTouched", item.name.get());
    this.sendNetworkEvent(item, Events.touchedByPacman, {});
  }
  respawn(){
    super.stopConstantMotion();
    super.moveToStart();
    super.startConstantMotion();
  }
  teleportPacman(spawnPoint: SpawnPointGizmo){
    spawnPoint.teleportPlayer(super.getAttachedPlayer()!);
  }

}
Component.register(PacMan);