import {CodeBlockEvents, Component, Entity} from "horizon/core";
import {Events} from "./GameUtilities";

class PacMan extends Component<typeof PacMan> {
  static propsDefinition = {
    CollectionTrigger: {type: Entity},
  };

  start() {
    this.connectCodeBlockEvent(this.props.CollectionTrigger, CodeBlockEvents.OnEntityEnterTrigger, (item: Entity) => {this.itemTouched(item);});
  }
  itemTouched(item: Entity){
    this.sendLocalEvent(item, Events.touchedByPacman, {});
  }
}
Component.register(PacMan);