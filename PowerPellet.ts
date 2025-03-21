import {Component, PhysicalEntity, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";

class PowerPellet extends Component<typeof PowerPellet> {
  static propsDefinition = {
    GameManager: {type: PropTypes.Entity}
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
  }

  start() {
    
  }
  collected() {
    console.log("PowerPellet Collected");
    this.entity.collidable.set(false);
    this.entity.visible.set(false);
    this.sendNetworkEvent(this.props.GameManager!, Events.pacDotCollected, {pacDot: this.entity});
  }
}
Component.register(PowerPellet);