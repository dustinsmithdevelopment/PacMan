import {CodeBlockEvents, Component, Entity, PhysicalEntity, Player, PropTypes, Vec3} from "horizon/core";
import {Events} from "./GameUtilities";

class SetPacman extends Component{
  static propsDefinition = {
    pacman: {type: PropTypes.Entity}
  };
  preStart() {

  }

  start() {
    this.entity.as(PhysicalEntity).locked.set(true);
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_,player: Player)=>{
      console.log("sending assignPacman with ", player);
      this.sendNetworkEvent(this.props.pacman!, Events.assignPlayer, {player: player});
      // this.async.setTimeout(()=>{player.position.set(new Vec3(4,4,6))}, 1000);
    });
  }
}
Component.register(SetPacman);
class RemovePacman extends Component{
  static propsDefinition = {
    pacman: {type: PropTypes.Entity}
  };
  preStart() {

  }

  start() {
    this.entity.as(PhysicalEntity).locked.set(true);
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_,player: Player)=>{
      this.sendNetworkEvent(this.props.pacman!, Events.unassignPlayer, {player: player});
    });
  }
}
Component.register(RemovePacman);
class SetGhost extends Component{
  static propsDefinition = {
    ghost: {type: PropTypes.Entity}
  };
  preStart() {

  }

  start() {
    this.entity.as(PhysicalEntity).locked.set(true);
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_,player: Player)=>{
      console.log("sending assignGhost with ", player);
      this.sendNetworkEvent(this.props.ghost!, Events.assignPlayer, {player: player});
    });
  }
}
Component.register(SetGhost);
class RemoveGhost extends Component{
  static propsDefinition = {
    ghost: {type: PropTypes.Entity}
  };
  preStart() {

  }

  start() {
    this.entity.as(PhysicalEntity).locked.set(true);
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_,player: Player)=>{
      this.sendNetworkEvent(this.props.ghost!, Events.unassignPlayer, {player: player});
    });
  }
}
Component.register(RemoveGhost);

class StartConstantMotion extends Component{
  static propsDefinition = {};
  preStart() {

  }

  start() {
    this.entity.as(PhysicalEntity).locked.set(true);
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, (item: Entity)=>{
      console.log("sending startConstantMotion");
      this.sendNetworkEvent(item, Events.startConstantMotion, {});
    });
  }
}
Component.register(StartConstantMotion);

class StopConstantMotion extends Component{
  static propsDefinition = {};
  preStart() {

  }

  start() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, (item: Entity)=>{
      console.log("sending stopConstantMotion");
      this.sendNetworkEvent(item, Events.stopConstantMotion, {});
    });
  }
}
Component.register(StopConstantMotion);

// class GenericComponent extends Component{
//     static propsDefinition = {};
//     preStart() {
//
//     }
//
//     start() {
//
//     }
// }
// Component.register(GenericComponent);