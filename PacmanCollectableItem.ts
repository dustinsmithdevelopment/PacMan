import {CodeBlockEvents, Component, Player, PlayerVisibilityMode} from "horizon/core";
import {Events} from "./GameUtilities";

export abstract class PacmanCollectableItem extends Component {

    preStart() {
        this.connectNetworkBroadcastEvent(Events.setPacman, (payload:{pacMan: Player})=>{this.makeVisibleForPacman(payload.pacMan);})
        this.connectNetworkBroadcastEvent(Events.resetGame, this.resetState.bind(this));
    }
    start() {
        this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);    }

    private makeVisibleForPacman(pacMan: Player){
        this.entity.setVisibilityForPlayers([pacMan], PlayerVisibilityMode.VisibleTo);
    }
    private resetState() {
        this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);
    }
}
