import {AudioGizmo, CodeBlockEvents, Component, Entity, Player, PlayerVisibilityMode} from "horizon/core";
import {Events} from "./GameUtilities";

export abstract class PacmanCollectableItem extends Component {
    private pacman: Player|undefined;
    private players: Player[] = [];
    private sound: AudioGizmo|undefined;
    preStart() {
        this.connectNetworkBroadcastEvent(Events.setPacman, (payload:{pacMan: Player})=>{
            this.pacman = payload.pacMan;
            this.makeVisibleForPacman(payload.pacMan);
        });
        this.connectNetworkBroadcastEvent(Events.resetGame, this.resetState.bind(this));
        this.connectNetworkBroadcastEvent(Events.updateCurrentGamePlayers, (payload: {players: Player[]})=>{
            this.players = payload.players;
        })
    }
    start() {
        this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);
    }
    protected setAudioGizmo(audioGizmo: Entity) {
        this.sound = audioGizmo.as(AudioGizmo);
    }

    protected hideItem(){
        this.entity.visible.set(false);
        // this.entity.collidable.set(false);
            this.sound?.play({players: this.players, fade: 0});

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
