import {CodeBlockEvents, Component, Player, PlayerVisibilityMode} from "horizon/core";
import {Events} from "./GameUtilities";

export abstract class PacmanCollectableItem extends Component {
    private pacman: Player|undefined;
    preStart() {
        this.connectNetworkBroadcastEvent(Events.setPacman, (payload:{pacMan: Player})=>{
            this.pacman = payload.pacMan;
            this.makeVisibleForPacman(payload.pacMan);
        })
        this.connectNetworkBroadcastEvent(Events.resetGame, this.resetState.bind(this));
    }
    start() {
        this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);    }

    protected hideItem(){
        this.entity.visible.set(false);
        // this.entity.collidable.set(false);
    }
    private makeVisibleForPacman(pacMan: Player){
        this.async.setTimeout(()=>{this.entity.setVisibilityForPlayers([pacMan], PlayerVisibilityMode.VisibleTo);},100);
    }
    private resetState() {
        console.log("Resetting an item");
        this.entity.visible.set(true);
        this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);
        this.pacman && this.makeVisibleForPacman(this.pacman);
        // this.entity.collidable.set(true);

    }
}
