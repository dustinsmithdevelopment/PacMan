import {Events} from "./GameUtilities";
import {PacmanCollectableItem} from "./PacmanCollectableItem";
import {AudioGizmo, Component, Entity, Player, PlayerVisibilityMode, PropTypes} from "horizon/core";

class Fruit extends Component<typeof Fruit> {
  private pacMan: Player|undefined;
  private players: Player[] = [];
  private sound: AudioGizmo|undefined;
  private collectable = false;
  private points: number = 100;
  static propsDefinition = {
    pointValue: { type: PropTypes.Number },
    sound: {type: PropTypes.Entity}
  };
  preStart() {
    this.connectNetworkEvent(this.entity, Events.touchedByPacman, this.collected.bind(this));
    this.connectNetworkEvent(this.entity, Events.fruitCollectable, this.setCollectable.bind(this));
    this.connectNetworkBroadcastEvent(Events.fruitCollectable, this.setCollectable.bind(this));
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
    if (this.props.pointValue < 0){
      this.points = this.props.pointValue;
    }
    if (this.props.sound){
      this.sound = this.props.sound!.as(AudioGizmo);
    }
    this.async.setTimeout(this.setUncollectable.bind(this),200);
  }
  setUncollectable(){
    this.collectable = false;
    this.hideItem();
  }
  setCollectable(){
    this.collectable = true;
    this.entity.visible.set(true);
  }

  collected() {
    if(this.collectable){
      // console.log("Fruit Collected");
      this.setUncollectable();
      this.sendNetworkBroadcastEvent(Events.fruitCollected, {points: this.points});
    }
  }

  private makeInvisibleForGhosts(){
    if (this.pacMan && this.players.length > 0){
      const ghosts = this.players.filter((player) => {return player.id !== this.pacMan!.id});
      // console.log("we are starting with", this.players.length,"players and making visible for", this.pacMan, "and invisible for", ghosts.length, "pacman is a ghost:", ghosts.includes(this.pacMan) );
      this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.VisibleTo);
      this.async.setTimeout(() => {
        this.entity.setVisibilityForPlayers(ghosts, PlayerVisibilityMode.HiddenFrom);
      }, 100);
    }
  }
  private resetState() {
    this.setUncollectable();
    this.players = [];
    this.pacMan = undefined;

  }
  protected hideItem(){
    this.entity.visible.set(false);
    this.sound?.play({players: this.players, fade: 0});

  }
}
Component.register(Fruit);
