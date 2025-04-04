import {CodeBlockEvents, Component, Entity, PhysicalEntity, Player, PropTypes, Vec3} from "horizon/core";
import {Events} from "./GameUtilities";


class PlayerJoinEmulation extends Component{
  static propsDefinition = {
    playerManager: {type: PropTypes.Entity}
  };

  start() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => {
      // if (player.name.get().startsWith("NPC")){
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue1, {player: player});}, 10_000);
        

      // }
    })
  }
}
Component.register(PlayerJoinEmulation);

class PlayerJoinGrab extends Component{
  static propsDefinition = {
    playerManager: {type: PropTypes.Entity}
  };

  start() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_, player: Player) => {
      if (player.name.get().startsWith("NPC")){
        this.async.setTimeout(()=>{this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue1, {player: player});}, 10_000);


      }
    })
  }
}
Component.register(PlayerJoinGrab);




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