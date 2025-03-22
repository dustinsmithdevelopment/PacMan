import {CodeBlockEvents, Component, Entity, PropTypes, SpawnPointGizmo} from "horizon/core";
import {Events} from "./GameUtilities";

class PacManTeleporter extends Component<typeof PacManTeleporter> {
  private spawnPoint: SpawnPointGizmo|undefined;
  static propsDefinition = {
    spawnPoint: {
      type: PropTypes.Entity,
      required: true,
    }
  };

  start() {
    this.spawnPoint = this.props.spawnPoint!.as(SpawnPointGizmo);
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, (playerSuit: Entity)=>{
      this.sendNetworkEvent(playerSuit, Events.teleportPacman, {spawnPoint: this.spawnPoint!});
    })
  }
}
Component.register(PacManTeleporter);