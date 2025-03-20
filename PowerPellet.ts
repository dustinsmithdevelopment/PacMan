import {Component, PhysicalEntity} from "horizon/core";
import {Events} from "./GameUtilities";

class PowerPellet extends Component<typeof PowerPellet> {
  static propsDefinition = {};
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
  }

  start() {
    
  }
  collected() {

  }
}
Component.register(PowerPellet);