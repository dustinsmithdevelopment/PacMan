import {Component, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";

class Fruit extends Component<typeof Fruit> {
  private points: number = 40;
  static propsDefinition = {
    manager: {type: PropTypes.Entity},
    pointValue: { type: PropTypes.Number },
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
  }

  start() {
    if (this.props.pointValue.valueOf() < 0){
      this.points = this.props.pointValue.valueOf();
    }
  }
  collected() {
    this.entity.visible.set(false);
    this.entity.collidable.set(false);
    this.sendNetworkEvent(this.props.manager!, Events.collectFruit, {fruitValue: this.points});
  }

}
Component.register(Fruit);