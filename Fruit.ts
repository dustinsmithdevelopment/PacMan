import {Component, PropTypes} from "horizon/core";

class Fruit extends Component<typeof Fruit> {
  private points: number = 0;
  static propsDefinition = {
    pointValue: { type: PropTypes.Number },
  };

  start() {
    this.points = this.props.pointValue.valueOf();
  }


}
Component.register(Fruit);