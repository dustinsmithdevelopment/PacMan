import {
  Component,
  Player,
  CodeBlockEvents,
  PropTypes,
  LocalEvent, Entity
} from "horizon/core";
import {Events} from "./GameUtilities";
import {UIComponent, UINode, View, ImageSource, Image, Pressable} from "horizon/ui";






class MobileUI extends UIComponent {
  panelWidth = 1920;
  panelHeight = 1080;

  private PlayerSuit: Entity|undefined;


  static propsDefinition = {
    playerSuit: {type: PropTypes.Entity},
    upButton: {type: PropTypes.Asset},
    downButton: {type: PropTypes.Asset},
    leftButton: {type: PropTypes.Asset},
    rightButton: {type: PropTypes.Asset},
  };
  initializeUI(): UINode {
    const UpButtonSource: ImageSource = ImageSource.fromTextureAsset(this.props.upButton);
    const DownButtonSource: ImageSource = ImageSource.fromTextureAsset(this.props.downButton);
    const LeftButtonSource: ImageSource = ImageSource.fromTextureAsset(this.props.leftButton);
    const RightButtonSource: ImageSource = ImageSource.fromTextureAsset(this.props.rightButton);

    return View({children:[
        this.MoveButton(Events.moveForward, UpButtonSource, 420, 1_100),
        this.MoveButton(Events.moveReverse, DownButtonSource, 500, 1_100),
        this.MoveButton(Events.moveLeft, LeftButtonSource, 500, 1_020),
        this.MoveButton(Events.moveRight, RightButtonSource, 500, 1_180),
      ], style: {position: "absolute"}});
  }



  preStart() {
    this.connectNetworkEvent(this.entity, Events.assignPlayer, (payload: {player: Player}) => {this.assignPlayer(payload.player)});
    this.connectNetworkEvent(this.entity, Events.unassignPlayer, ()=>{this.unassignPlayer()})
  }
  start() {
    // this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => {this.entity.owner.set(player); this.assignPlayer(player);});
    if (this.entity.owner.get().id != this.world.getServerPlayer().id){this.assignPlayer(this.entity.owner.get())}
    this.PlayerSuit = this.props.playerSuit;
  }

  MoveButton(event: LocalEvent, imageSource: ImageSource, top: number, left: number): UINode {
    return Pressable({children: [Image({source: imageSource, style:{width: 80, height: 80, top: top, left: left, position: "absolute", borderRadius: 20}})], onClick:()=>{this.sendLocalEvent(this.PlayerSuit!, event, {})}});
  }
  assignPlayer(p: Player) {
    // PlayerControls.disableSystemControls();


  }
  unassignPlayer() {
    // TODO do the stuffs
    // PlayerControls.enableSystemControls();
    this.entity.owner.set(this.world.getServerPlayer());
  }

}
Component.register(MobileUI);