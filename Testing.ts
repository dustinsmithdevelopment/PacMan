import {CodeBlockEvents, Component, Entity, Player, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";

class SetPacman extends Component{
  static propsDefinition = {
    pacman: {type: PropTypes.Entity}
  };
  preStart() {

  }

  start() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
      console.log("Sending assignPlayer with ", player + ". Name: " + player.name.get(), " ID: " + player.id.valueOf());
      this.sendLocalEvent(this.props.pacman!, Events.assignPlayer, {player: player});
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
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
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
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
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
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
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
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, (item: Entity)=>{
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