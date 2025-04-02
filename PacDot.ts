import {Component, Entity, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";

class PacDot extends Component<typeof PacDot> {
  private gameManager: Entity | undefined;
  static propsDefinition = {
    GameManager: {type: PropTypes.Entity}
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
  }

  start() {
    this.gameManager = this.props.GameManager;
    this.registerComponent();
  }
  registerComponent() {
    this.sendNetworkBroadcastEvent(Events.registerPacDot, {pacDot: this.entity});
  }
  collected(){
    console.log("PacDot Collected");
    this.entity.collidable.set(false);
    this.entity.visible.set(false);
    this.sendNetworkBroadcastEvent(Events.pacDotCollected, {pacDot: this.entity});
  }
}
Component.register(PacDot);