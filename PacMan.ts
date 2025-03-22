import {
  CodeBlockEvents, Component, Entity, PropTypes,} from "horizon/core";
import {Events} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {
    homePositionSpawn: {type: PropTypes.Entity},
    collectionTrigger: {type: PropTypes.Entity},
    manager: {type: PropTypes.Entity},
  };

  preStart() {
    super.preStart();
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

}
Component.register(PacMan);