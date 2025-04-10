import {
  Color,
  Component,
  Entity,
  EntityTagMatchOperation,
  Player,
  PropTypes,
  SerializableState,
  Vec3,
} from "horizon/core";
import {Events} from "./GameUtilities";
import {Binding, DimensionValue, Image, ImageSource, UIComponent, UINode, View} from "horizon/ui";


const MAP_UPSCALE = 61;
const ADD_X = 0;
const ADD_Y = 0;




//TODO GENERATE ARRAY ON EACH CYCLE

const offset = new Vec3(ADD_Y,0,ADD_X);
class PacmanUI extends UIComponent {
  panelWidth = 1920;
  panelHeight = 1080;

  private origin: Vec3|undefined;

  private pacDots: Entity[] = [];
  private powerPellets: Entity[] = [];
  private fruits: Entity[] = [];




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
  private pacDotLocationsX: number[] = [];
  private pacDotLocationsY: number[] = [];
  private pacDotVisibility: string[] = [];
  private pacDotDisplayLocationsX: Binding<number[]> = new Binding<number[]>([]);
  private pacDotDisplayLocationsY: Binding<number[]> = new Binding<number[]>([]);
  private pacDotDisplayVisibility: Binding<string[]> = new Binding<string[]>([]);
  private powerPelletLocationsX: number[] = [];
  private powerPelletLocationsY: number[] = [];
  private powerPelletVisibility: string[] = [];
  private powerPelletDisplayLocationsX: Binding<number[]> = new Binding<number[]>([]);
  private powerPelletDisplayLocationsY: Binding<number[]> = new Binding<number[]>([]);
  private powerPelletDisplayVisibility: Binding<string[]> = new Binding<string[]>([]);
  private fruitLocationsX: number[] = [];
  private fruitLocationsY: number[] = [];
  private fruitVisibility: string[] = [];
  private fruitDisplayLocationsX: Binding<number[]> = new Binding<number[]>([]);
  private fruitDisplayLocationsY: Binding<number[]> = new Binding<number[]>([]);
  private fruitDisplayVisibility: Binding<string[]> = new Binding<string[]>([]);


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
    fruitImage: {type: PropTypes.Asset},
    powerPelletImage: {type: PropTypes.Asset},
  };
  initializeUI(): UINode {
    const backgroundImage: ImageSource = ImageSource.fromTextureAsset(this.props.backgroundImage);
    const playerImage: ImageSource = ImageSource.fromTextureAsset(this.props.playerImage);
    const enemyImage: ImageSource = ImageSource.fromTextureAsset(this.props.enemyImage);
    const pacDotImage: ImageSource = ImageSource.fromTextureAsset(this.props.pacDotImage);
    const fruitImage: ImageSource = ImageSource.fromTextureAsset(this.props.fruitImage);
    const powerPelletImage: ImageSource = ImageSource.fromTextureAsset(this.props.powerPelletImage);


    this.pacDots = this.world.getEntitiesWithTags(["PacDot"], EntityTagMatchOperation.HasAnyExact);
    console.log(this.pacDots.length, "PacDots");
    this.powerPellets = this.world.getEntitiesWithTags(["PowerPellet"], EntityTagMatchOperation.HasAnyExact);
    console.log(this.powerPellets.length, "PowerPellets");
    this.fruits = this.world.getEntitiesWithTags(["Fruit"], EntityTagMatchOperation.HasAnyExact);
    console.log(this.fruits.length, "Fruit");

    let displayItems: UINode[] = []
    console.log("Dots found by PacmanUI",this.pacDots.length);


    this.pacDotLocationsX = Array(this.pacDots.length).fill(0);
    this.pacDotLocationsY = Array(this.pacDots.length).fill(0);
    this.pacDotVisibility = Array(this.pacDots.length).fill("flex");
    this.pacDotDisplayLocationsX.set(this.pacDotLocationsX)
    this.pacDotDisplayLocationsY.set(this.pacDotLocationsY);
    this.pacDotDisplayVisibility.set(this.pacDotVisibility);

    this.powerPelletLocationsX = Array(this.powerPellets.length).fill(0);
    this.powerPelletLocationsY = Array(this.powerPellets.length).fill(0);
    this.powerPelletVisibility = Array(this.powerPellets.length).fill("flex");
    this.powerPelletDisplayLocationsX.set(this.powerPelletLocationsX)
    this.powerPelletDisplayLocationsY.set(this.powerPelletLocationsY);
    this.powerPelletDisplayVisibility.set(this.powerPelletVisibility);

    this.fruitLocationsX = Array(this.fruits.length).fill(0);
    this.fruitLocationsY = Array(this.fruits.length).fill(0);
    this.fruitVisibility = Array(this.fruits.length).fill("flex");
    this.fruitDisplayLocationsX.set(this.fruitLocationsX)
    this.fruitDisplayLocationsY.set(this.fruitLocationsY);
    this.fruitDisplayVisibility.set(this.fruitVisibility);





    this.pacDots.forEach((_:Entity, index:number) => {
      displayItems.push(Image({source: pacDotImage, style:{width: 32, height: 32, bottom: this.pacDotDisplayLocationsX.derive((numberArray)=>{
            return numberArray[index];
          }), left: this.pacDotDisplayLocationsY.derive((numberArray)=>{
            return numberArray[index];
          }), position: "absolute", zIndex: 1}}));
    });

    this.powerPellets.forEach((_:Entity, index:number) => {
      displayItems.push(Image({source: powerPelletImage, style:{width: 32, height: 32, bottom: this.powerPelletDisplayLocationsX.derive((numberArray)=>{
            return numberArray[index];
          }), left: this.powerPelletDisplayLocationsY.derive((numberArray)=>{
            return numberArray[index];
          }), position: "absolute", zIndex: 1}}));
    });

    this.fruits.forEach((_:Entity, index:number) => {
      displayItems.push(Image({source: fruitImage, style:{width: 32, height: 32, bottom: this.fruitDisplayLocationsX.derive((numberArray)=>{
            return numberArray[index];
          }), left: this.fruitDisplayLocationsY.derive((numberArray)=>{
            return numberArray[index];
          }), position: "absolute", zIndex: 1}}));
    });


    return View({
      children: [View({
        children: [
          Image({
            source: backgroundImage,
            style: {width: "100%", height: "100%", top: 0, left: 0, position: "absolute", zIndex: -1, opacity: 0.5}
          }),
          Image({
            source: playerImage,
            style: {width: 32, height: 32, bottom: this.pacManX, left: this.pacManY, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: 32, height: 32, bottom: this.enemy1X, left: this.enemy1Y, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: 32, height: 32, bottom: this.enemy2X, left: this.enemy2Y, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: 32, height: 32, bottom: this.enemy3X, left: this.enemy3Y, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: 32, height: 32, bottom: this.enemy4X, left: this.enemy4Y, position: "absolute", zIndex: 2}
          }),
          ...displayItems
        ], style: {position: "absolute", width: "30%", height: "30%"}
      })], style: {width: "100%", height: "100%", position: "absolute", backgroundColor: Color.white}
    })
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

    const originRef: Entity = this.props.trackingOrigin;
    this.origin = originRef.position.get().add(offset);
    this.async.setTimeout(()=>{
      this.setItemPositions();
      this.async.setInterval(this.updatePlayerPositions.bind(this),100);
    },10_000)

  }
  updatePlayerPositions(){
    // @ts-ignore
    const pacPos = this.props.pacmanSuit!.position.get().sub(this.origin!).mul(MAP_UPSCALE);
    // console.log("Pacman", pacPos.x, pacPos.y, pacPos.z);
    // @ts-ignore
    const e1Pos = this.props.enemy1Suit!.position.get().sub(this.origin!).mul(MAP_UPSCALE);
    // console.log("e1Pos", e1Pos.x, pacPos.y, pacPos.z);
    // @ts-ignore
    const e2Pos = this.props.enemy2Suit!.position.get().sub(this.origin!).mul(MAP_UPSCALE);
    // console.log("e2Pos", e2Pos.x, pacPos.y, pacPos.z);
    // @ts-ignore
    const e3Pos = this.props.enemy3Suit!.position.get().sub(this.origin!).mul(MAP_UPSCALE);
    // console.log("e3Pos", e3Pos.x, pacPos.y, pacPos.z);
    // @ts-ignore
    const e4Pos = this.props.enemy4Suit!.position.get().sub(this.origin!).mul(MAP_UPSCALE);
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
  setItemPositions(){
    this.pacDots.forEach((dot: Entity, index: number)=>{
      const currentDotLocation = dot.position.get().sub(this.origin!).mul(MAP_UPSCALE);
      this.pacDotLocationsX[index] = currentDotLocation.z;
      this.pacDotLocationsY[index] = currentDotLocation.x;
    });
    this.pacDotDisplayLocationsX.set(this.pacDotLocationsX);
    this.pacDotDisplayLocationsY.set(this.pacDotLocationsY);


    this.powerPellets.forEach((pellet: Entity, index: number)=>{
      const currentPelletLocation = pellet.position.get().sub(this.origin!).mul(MAP_UPSCALE);
      this.powerPelletLocationsX[index] = currentPelletLocation.z;
      this.powerPelletLocationsY[index] = currentPelletLocation.x;
    });
    this.powerPelletDisplayLocationsX.set(this.powerPelletLocationsX);
    this.powerPelletDisplayLocationsY.set(this.powerPelletLocationsY);


    this.fruits.forEach((fruit: Entity, index: number)=>{
      const currentFruitLocation = fruit.position.get().sub(this.origin!).mul(MAP_UPSCALE);
      this.fruitLocationsX[index] = currentFruitLocation.z;
      this.fruitLocationsY[index] = currentFruitLocation.x;
    });
    this.fruitDisplayLocationsX.set(this.fruitLocationsX);
    this.fruitDisplayLocationsY.set(this.fruitLocationsY);
  }
  transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
    return {pacDots: this.pacDots, powerPellets: this.powerPellets, fruits: this.fruits};
  }
  receiveOwnership(state: {pacDots: Entity[], powerPellets: Entity[], fruits: Entity[]} | null, _oldOwner: Player, _newOwner: Player) {
    this.pacDots = state?.pacDots || [];
    this.powerPellets = state?.powerPellets || [];
    this.fruits = state?.fruits || [];
  }

}
Component.register(PacmanUI);