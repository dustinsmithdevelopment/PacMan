import {Component, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";
import {PacmanCollectableItem} from "./PacmanCollectableItem";

class Fruit extends PacmanCollectableItem {
  private collectable = false;
  private points: number = 40;
  static propsDefinition = {
    pointValue: { type: PropTypes.Number },
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
    super.preStart();
  }

  start() {
    this.setUncollectable();
    if (this.props.pointValue < 0){
      this.points = this.props.pointValue;
    }
    super.start();
  }
  setUncollectable(){
    this.collectable = false;
    this.entity.visible.set(false);
  }
  setCollectable(){
    this.collectable = true;
    this.entity.visible.set(true);
  }

  collected() {
    console.log("Fruit Collected");
    this.entity.visible.set(false);
    this.entity.collidable.set(false);
    this.sendNetworkBroadcastEvent(Events.fruitCollected, {});
  }

}
Component.register(Fruit);