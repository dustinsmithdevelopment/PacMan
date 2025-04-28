import {AudioGizmo, Component, Entity, Player, PlayerVisibilityMode} from "horizon/core";
import {Events} from "./GameUtilities";

export abstract class PacmanCollectableItem extends Component {
    private pacMan: Player|undefined;
    private players: Player[] = [];
    private sound: AudioGizmo|undefined;
    preStart() {
        this.connectNetworkBroadcastEvent(Events.setPacman, (payload:{pacMan: Player})=>{
            this.pacMan = payload.pacMan;
            this.makeInvisibleForGhosts();
        });
        this.connectNetworkBroadcastEvent(Events.resetGame, this.resetState.bind(this));
        this.connectNetworkBroadcastEvent(Events.updateCurrentGamePlayers, (payload: {players: Player[]})=>{
            this.players = payload.players;
            this.makeInvisibleForGhosts();
        });
    }
    start() {
    }
    protected setAudioGizmo(audioGizmo: Entity) {
        this.sound = audioGizmo.as(AudioGizmo);
    }

    protected hideItem(){
        this.entity.visible.set(false);
        // this.entity.collidable.set(false);
            this.sound?.play({players: this.players, fade: 0});

    }
    private makeInvisibleForGhosts(){
        if (this.pacMan && this.players.length > 0){
            const ghosts = this.players.filter((player) => {return player.id !== this.pacMan!.id});
            console.log("we are starting with", this.players.length,"players and making visible for", this.pacMan, "and invisible for", ghosts.length, "pacman is a ghost:", ghosts.includes(this.pacMan) );
            this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.VisibleTo);
            this.async.setTimeout(() => {
                this.entity.setVisibilityForPlayers(ghosts, PlayerVisibilityMode.HiddenFrom);
            }, 100);
        }
    }
    private resetState() {
        console.log("Resetting an item");
        this.entity.visible.set(true);
        this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.VisibleTo);
        this.players = [];
        this.pacMan = undefined;
        // this.entity.collidable.set(true);

    }
}
