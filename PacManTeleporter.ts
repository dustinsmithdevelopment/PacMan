import {CodeBlockEvents, Component, Entity, PropTypes, SpawnPointGizmo, Vec3} from "horizon/core";
import {Events} from "./GameUtilities";

class PacManTeleporter extends Component<typeof PacManTeleporter> {
  private target: Vec3|undefined;
  static propsDefinition = {
    targetRef: {
      type: PropTypes.Entity,
      required: true,
    }
  };

  start() {
    this.target = this.props.targetRef!.position.get();
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, (playerSuit: Entity)=>{
      this.sendNetworkEvent(playerSuit, Events.teleportPacman, {location: this.target!});
    })
  }
}
Component.register(PacManTeleporter);