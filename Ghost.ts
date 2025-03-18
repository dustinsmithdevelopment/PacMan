import {Component} from "horizon/core";
import {Events} from "./GameUtilities";

class Ghost extends Component<typeof Ghost> {
  static propsDefinition = {};
  preStart() {
    this.connectLocalEvent(this.entity, Events.touchedByPacman, this.touchedByPacman.bind(this));
  }
  start() {

  }
  touchedByPacman() {

  }
}
Component.register(Ghost);