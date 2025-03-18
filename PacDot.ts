import {Component, Entity, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";

class PacDot extends Component<typeof PacDot> {
  private gameManager: Entity | undefined;
  static propsDefinition = {
    GameManager: {type: PropTypes.Entity}
  };
  preStart() {
    this.connectLocalEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
  }

  start() {
    this.gameManager = this.props.GameManager;
    this.registerComponent();
  }
  registerComponent() {
    this.sendLocalEvent(this.gameManager!, Events.registerPowerPellet, {pellet: this.entity});
  }
  collected(){

  }
}
Component.register(PacDot);