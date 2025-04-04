import {
  CodeBlockEvents, Component, Entity, Player, PropTypes, SpawnPointGizmo,
} from "horizon/core";
import {Events} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {
    homePositionSpawn: {type: PropTypes.Entity, required: true},
    collectionTrigger: {type: PropTypes.Entity, required: true},
    manager: {type: PropTypes.Entity, required: true},
    mobileUI: {type: PropTypes.Entity, required: true},
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
    super.setRole("PacMan");
    super.SetUI(this.props.mobileUI);
  }
  itemTouched(item: Entity){
    // console.log("itemTouched", item.name.get());
    this.sendNetworkEvent(item, Events.touchedByPacman, {});
  }
  respawn(){
    console.log("Event is being received by pacman to respawn");
    super.moveToStart();
  }

  teleportPacman(spawnPoint: SpawnPointGizmo){
    spawnPoint.teleportPlayer(super.getAttachedPlayer()!);
  }

}
Component.register(PacMan);