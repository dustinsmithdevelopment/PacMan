import {
  CodeBlockEvents,
  Component,
  Entity,
  Player,
  PlayerVisibilityMode,
  PropTypes,
  SerializableState,
  SpawnPointGizmo, Vec3,
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
  private collectedEntities: bigint[] = [];

  preStart() {
    super.preStart();
    this.connectNetworkEvent(this.entity, Events.teleportPacman, (payload: {location: Vec3})=>{
      this.teleportPacman(payload.location);
    });
    this.connectNetworkEvent(this.entity, Events.respawnPacman, ()=>{this.respawn();})
    this.connectNetworkBroadcastEvent(Events.resetGame, ()=>{this.collectedEntities = [];});
  }
  start() {
    this.connectCodeBlockEvent(this.props.collectionTrigger, CodeBlockEvents.OnEntityEnterTrigger, (entity: Entity)=>{
      this.itemTouched(entity);
    });
    // TODO
    const homePositionSpawn: Entity = this.props.homePositionSpawn!
    super.SetHomePosition(homePositionSpawn);
    this.entity.position.set(new Vec3(0,500, 0));
    super.setRole("the dragon");
  }
  itemTouched(item: Entity){
    if (!this.collectedEntities.includes(item.id)){
      if(!(item.tags.contains("ghost") || item.tags.contains("fruit"))){
        this.collectedEntities.push(item.id);
      }
      this.sendNetworkEvent(item, Events.touchedByPacman, {});
    }

  }
  respawn(){
    console.log("Event is being received by pacman to respawn");
    super.moveToStart();
  }

  teleportPacman(location: Vec3){
    super.getAttachedPlayer()?.position.set(location);
  }
  transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
    if (_oldOwner !== this.world.getServerPlayer()) {
      const pacmanUI: Entity = this.props.pacmanUI;
      pacmanUI.setVisibilityForPlayers([_oldOwner], PlayerVisibilityMode.HiddenFrom);
    }
    return super.transferOwnership(_oldOwner, _newOwner);
  }
  receiveOwnership(state: { homePosition: Entity }, _oldOwner: Player, _newOwner: Player) {
    if (_newOwner !== this.world.getServerPlayer()) {
      const pacmanUI: Entity = this.props.pacmanUI;
      pacmanUI.setVisibilityForPlayers([_newOwner], PlayerVisibilityMode.VisibleTo);
    }
    super.receiveOwnership(state, _oldOwner, _newOwner);
  }

}
Component.register(PacMan);