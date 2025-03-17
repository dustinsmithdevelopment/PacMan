import {Component, Entity} from "horizon/core";
import {Events} from "./GameUtilities";

class GameManager extends Component<typeof GameManager> {
  static propsDefinition = {};
  private dotsRemaining = 0;
  private points = 0;
  private lives = 3;
  private allPellets: Map<bigint, Entity> = new Map<bigint, Entity>();
  preStart() {
    this.connectLocalEvent(this.entity, Events.registerPowerPellet, (pellet: Entity)=>{this.registerPowerPellet(pellet);})
  }

  start() {

  }
  registerPowerPellet(pellet: Entity) {
    this.allPellets.set(pellet.id, pellet);
  }
}
Component.register(GameManager);