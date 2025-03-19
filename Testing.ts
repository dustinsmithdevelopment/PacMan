import {CodeBlockEvents, Component, Entity, Player} from "horizon/core";
import {Events} from "./GameUtilities";

class SetPacman extends Component{
    static propsDefinition = {
        pacman: {type: Entity}
    };
    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
           this.sendLocalEvent(this.props.pacman!, Events.assignPlayer, {player: player});
        });
    }
}
Component.register(SetPacman);
class RemovePacman extends Component{
    static propsDefinition = {
        pacman: {type: Entity}
    };
    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
            this.sendLocalEvent(this.props.pacman!, Events.unassignPlayer, {player: player});
        });
    }
}
Component.register(RemovePacman);
class SetGhost extends Component{
    static propsDefinition = {
        ghost: {type: Entity}
    };
    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
            this.sendLocalEvent(this.props.ghost!, Events.assignPlayer, {player: player});
        });
    }
}
Component.register(SetGhost);
class RemoveGhost extends Component{
    static propsDefinition = {
        ghost: {type: Entity}
    };
    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
            this.sendLocalEvent(this.props.ghost!, Events.unassignPlayer, {player: player});
        });
    }
}
Component.register(RemoveGhost);

class StartConstantMotion extends Component{
    static propsDefinition = {
        target: {type: Entity}
    };
    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
            this.sendLocalEvent(this.props.target!, Events.startConstantMotion, {player: Player});
        });
    }
}
Component.register(StartConstantMotion);

class StopConstantMotion extends Component{
    static propsDefinition = {
        target: {type: Entity}
    };
    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterTrigger, (player: Player)=>{
            this.sendLocalEvent(this.props.target!, Events.stopConstantMotion, {player: Player});
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