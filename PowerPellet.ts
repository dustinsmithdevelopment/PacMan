import {Component, PhysicalEntity, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";
import {PacmanCollectableItem} from "./PacmanCollectableItem";

class PowerPellet extends PacmanCollectableItem {
  static propsDefinition = {
    GameManager: {type: PropTypes.Entity}
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
    super.preStart();
  }

  start() {
    super.start();
  }

  collected() {
    console.log("PowerPellet Collected");
    super.hideItem();
    this.sendNetworkBroadcastEvent(Events.powerPelletCollected, {powerPellet: this.entity});
  }
}
Component.register(PowerPellet);