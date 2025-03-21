import {Component, Entity, PropTypes} from "horizon/core";
import {Events} from "./GameUtilities";

class GameManager extends Component<typeof GameManager> {
  static propsDefinition = {
    pacMan: {type: PropTypes.Entity},
    ghost1: {type: PropTypes.Entity},
    ghost2: {type: PropTypes.Entity},
    ghost3: {type: PropTypes.Entity},
    ghost4: {type: PropTypes.Entity},
  };
  private points = 0;
  private lives = 3;
  private allPacDots: Map<bigint, Entity> = new Map<bigint, Entity>();
  private remainingPacDots: Map<bigint, Entity> = new Map();
  preStart() {
    this.connectLocalEvent(this.entity, Events.registerPacDot, (pacDot: Entity)=>{this.registerPowerPellet(pacDot);})
  }

  start() {

  }
  registerPowerPellet(pellet: Entity) {
    this.allPacDots.set(pellet.id, pellet);
  }
}
Component.register(GameManager);