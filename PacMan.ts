import {
  CodeBlockEvents,
  Component,
  Entity,
  Player,
  PlayerVisibilityMode,
  PropTypes,
  SerializableState,
  SpawnPointGizmo,
} from "horizon/core";
import {Events} from "./GameUtilities";
import {PlayerRole} from "./PlayerRole";

class PacMan extends PlayerRole {
  static propsDefinition = {
    homePositionSpawn: {type: PropTypes.Entity, required: true},
    collectionTrigger: {type: PropTypes.Entity, required: true},
    manager: {type: PropTypes.Entity, required: true},
    pacmanUI: {type: PropTypes.Entity, required: true},
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
    super.SetSpawnPoint(this.props.homePositionSpawn!);
    super.setRole("PacMan");
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
  transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
    if (_oldOwner !== this.world.getServerPlayer()) {
      const pacmanUI: Entity = this.props.pacmanUI;
      pacmanUI.setVisibilityForPlayers([_oldOwner], PlayerVisibilityMode.HiddenFrom);
    }
    return super.transferOwnership(_oldOwner, _newOwner);
  }
  receiveOwnership(state: { spawnPointGizmo: SpawnPointGizmo }, _oldOwner: Player, _newOwner: Player) {
    if (_newOwner !== this.world.getServerPlayer()) {
      const pacmanUI: Entity = this.props.pacmanUI;
      pacmanUI.setVisibilityForPlayers([_newOwner], PlayerVisibilityMode.VisibleTo);
    }
    super.receiveOwnership(state, _oldOwner, _newOwner);
  }

}
Component.register(PacMan);