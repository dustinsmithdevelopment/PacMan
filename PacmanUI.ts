import {Component, Entity, EntityTagMatchOperation, Player, PropTypes, Vec3,} from "horizon/core";
import {Events} from "./GameUtilities";
import {Binding, DimensionValue, Image, ImageSource, UIComponent, UINode, View} from "horizon/ui";


const UPSCALE = 210;

//TODO GENERATE ARRAY ON EACH CYCLE


class PacmanUI extends UIComponent {
  panelWidth = 1920;
  panelHeight = 1080;
  private pacman: Entity|undefined;
  private enemy1: Entity|undefined;
  private enemy2: Entity|undefined;
  private enemy3: Entity|undefined;
  private enemy4: Entity|undefined;

  private origin: Vec3|undefined;

  private allDots: Entity[] = [];




  private pacManX = new Binding<DimensionValue>(0);
  private pacManY = new Binding<DimensionValue>(0);
  private enemy1X = new Binding<DimensionValue>(0);
  private enemy1Y = new Binding<DimensionValue>(0);
  private enemy2X = new Binding<DimensionValue>(0);
  private enemy2Y = new Binding<DimensionValue>(0);
  private enemy3X = new Binding<DimensionValue>(0);
  private enemy3Y = new Binding<DimensionValue>(0);
  private enemy4X = new Binding<DimensionValue>(0);
  private enemy4Y = new Binding<DimensionValue>(0);
  private locationsX: number[] = [];
  private locationsY: number[] = [];
  private visibility: string[] = [];
  private displayLocationsX: Binding<number[]> = new Binding<number[]>([]);
  private displayLocationsY: Binding<number[]> = new Binding<number[]>([]);
  private displayVisibility: Binding<string[]> = new Binding<string[]>([]);


  static propsDefinition = {
    trackingOrigin: {type: PropTypes.Entity},
    pacmanSuit: {type: PropTypes.Entity},
    enemy1Suit: {type: PropTypes.Entity},
    enemy2Suit: {type: PropTypes.Entity},
    enemy3Suit: {type: PropTypes.Entity},
    enemy4Suit: {type: PropTypes.Entity},
    backgroundImage: {type: PropTypes.Asset},
    playerImage: {type: PropTypes.Asset},
    enemyImage: {type: PropTypes.Asset},
    pacDotImage: {type: PropTypes.Asset},
    pacDots: {type: PropTypes.EntityArray},
  };
  initializeUI(): UINode {
    const backgroundImage: ImageSource = ImageSource.fromTextureAsset(this.props.backgroundImage);
    const playerImage: ImageSource = ImageSource.fromTextureAsset(this.props.playerImage);
    const enemyImage: ImageSource = ImageSource.fromTextureAsset(this.props.enemyImage);
    const pacDotImage: ImageSource = ImageSource.fromTextureAsset(this.props.pacDotImage);


    this.allDots = this.world.getEntitiesWithTags(["PacDot"], EntityTagMatchOperation.HasAnyExact);

    let displayDots: UINode[] = []
    console.log("Dots found by PacmanUI",this.allDots.length);


    // TODO make the binding arrays

    this.locationsX = Array(this.allDots.length).fill(0);
    this.locationsY = Array(this.allDots.length).fill(0);
    this.visibility = Array(this.allDots.length).fill("flex");
    this.displayLocationsX.set(this.locationsX)
    this.displayLocationsY.set(this.locationsY);
    this.displayVisibility.set(this.visibility);





    this.allDots.forEach((dot:Entity, index:number) => {
      displayDots.push(Image({source: pacDotImage, style:{width: 32, height: 32, bottom: this.displayLocationsX.derive((numberArray)=>{
            return numberArray[index];
          }), left: this.displayLocationsY.derive((numberArray)=>{
            return numberArray[index];
          }), position: "absolute", zIndex: 1}}));
    });


    return View({children:[
        Image({source: backgroundImage, style:{width: 1920, height: 1080, top: 0, left: 0, position: "absolute", zIndex: -1}}),
        Image({source: playerImage, style:{width: 32, height: 32, bottom: this.pacManX, left: this.pacManY, position: "absolute", zIndex: 2}}),
        Image({source: enemyImage, style:{width: 32, height: 32, bottom: this.enemy1X, left: this.enemy1Y, position: "absolute", zIndex: 2}}),
        Image({source: enemyImage, style:{width: 32, height: 32, bottom: this.enemy2X, left: this.enemy2Y, position: "absolute", zIndex: 2}}),
        Image({source: enemyImage, style:{width: 32, height: 32, bottom: this.enemy3X, left: this.enemy3Y, position: "absolute", zIndex: 2}}),
        Image({source: enemyImage, style:{width: 32, height: 32, bottom: this.enemy4X, left: this.enemy4Y, position: "absolute", zIndex: 2}}),
          ...displayDots
      ], style: {position: "absolute", width: "100%", height: "100%"}});
  }



  preStart() {
    this.connectNetworkEvent(this.entity, Events.assignPlayer, (payload: { player: Player }) => {
      this.assignPlayer(payload.player)
    });
    this.connectNetworkEvent(this.entity, Events.unassignPlayer, () => {
      this.unassignPlayer()
    });
  }
  start() {
    // this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, (player: Player) => {this.entity.owner.set(player); this.assignPlayer(player);});
    // if (this.entity.owner.get().id != this.world.getServerPlayer().id){this.assignPlayer(this.entity.owner.get())}
    this.pacman = this.props.pacmanSuit;
    this.enemy1 = this.props.enemy1Suit;
    this.enemy2 = this.props.enemy2Suit;
    this.enemy3 = this.props.enemy3Suit;
    this.enemy4 = this.props.enemy4Suit;

    const originRef: Entity = this.props.trackingOrigin;
    this.origin = originRef.position.get();
    this.async.setTimeout(()=>{
      this.setDotPositions();
      this.async.setInterval(this.updatePlayerPositions.bind(this),100);
    },10_000)

  }
  updatePlayerPositions(){
    const pacPos = this.pacman!.position.get().sub(this.origin!).mul(UPSCALE);
    // console.log("Pacman", pacPos.x, pacPos.y, pacPos.z);
    const e1Pos = this.enemy1!.position.get().sub(this.origin!).mul(UPSCALE);
    // console.log("e1Pos", e1Pos.x, pacPos.y, pacPos.z);
    const e2Pos = this.enemy2!.position.get().sub(this.origin!).mul(UPSCALE);
    // console.log("e2Pos", e2Pos.x, pacPos.y, pacPos.z);
    const e3Pos = this.enemy3!.position.get().sub(this.origin!).mul(UPSCALE);
    // console.log("e3Pos", e3Pos.x, pacPos.y, pacPos.z);
    const e4Pos = this.enemy4!.position.get().sub(this.origin!).mul(UPSCALE);
    // console.log("e4Pos", e4Pos.x, pacPos.y, pacPos.z);
    this.pacManY.set(pacPos.x as DimensionValue);
    this.pacManX.set(pacPos.z as DimensionValue);
    this.enemy1Y.set(e1Pos.x as DimensionValue);
    this.enemy1X.set(e1Pos.z as DimensionValue);
    this.enemy2Y.set(e2Pos.x as DimensionValue);
    this.enemy2X.set(e2Pos.z as DimensionValue);
    this.enemy3Y.set(e3Pos.x as DimensionValue);
    this.enemy3X.set(e3Pos.z as DimensionValue);
    this.enemy4Y.set(e4Pos.x as DimensionValue);
    this.enemy4X.set(e4Pos.z as DimensionValue);


  }


  assignPlayer(p: Player) {


  }
  unassignPlayer() {
    this.entity.owner.set(this.world.getServerPlayer());
  }
  setDotPositions(){
    this.allDots.forEach((dot: Entity, index: number)=>{
      console.log("Dot Original", index, ":", dot.position.get().z, ",", dot.position.get().x);
      const currentDotLocation = dot.position.get().sub(this.origin!).mul(UPSCALE);
      console.log("Dot Calculation", index, ":", currentDotLocation.z, ",", currentDotLocation.x);
      this.locationsX[index] = currentDotLocation.z;
      this.locationsY[index] = currentDotLocation.x;
    });
    this.displayLocationsX.set(this.locationsX);
    this.displayLocationsY.set(this.locationsY);
  }

}
Component.register(PacmanUI);