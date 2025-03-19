import {Component, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";

class Fruit extends Component<typeof Fruit> {
  private points: number = 0;
  static propsDefinition = {
    pointValue: { type: PropTypes.Number },
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
  }

  start() {
    this.points = this.props.pointValue.valueOf();
  }
  collected() {

  }

}
Component.register(Fruit);