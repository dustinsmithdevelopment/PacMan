import {Component, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";
import {PacmanCollectableItem} from "./PacmanCollectableItem";

class Fruit extends PacmanCollectableItem {
  private collectable = false;
  private points: number = 40;
  static propsDefinition = {
    pointValue: { type: PropTypes.Number },
    sound: {type: PropTypes.Entity}
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
    this.connectNetworkEvent(this.entity, Events.fruitCollectable, this.setCollectable.bind(this));
    super.preStart();
  }

  start() {
    this.setUncollectable();
    if (this.props.pointValue < 0){
      this.points = this.props.pointValue;
    }
    if (this.props.sound){
      super.setAudioGizmo(this.props.sound);
    }
    super.start();
  }
  setUncollectable(){
    this.collectable = false;
    super.hideItem();
  }
  setCollectable(){
    this.collectable = true;
    this.entity.visible.set(true);
  }

  collected() {
    if(this.collectable){
      console.log("Fruit Collected");
      this.setUncollectable();
      this.sendNetworkBroadcastEvent(Events.fruitCollected, {points: this.points});
    }
  }

}
Component.register(Fruit);