import {
  CodeBlockEvents,
  Component,
  Entity,
  EntityTagMatchOperation,
  Player,
  PlayerVisibilityMode,
  PropTypes,
  Vec3,
} from "horizon/core";
import {Events} from "./GameUtilities";
import {Binding, DimensionValue, Image, ImageSource, UIComponent, UINode, View} from "horizon/ui";


const MAP_UPSCALE = 32;
const ICON_SIZE = 16;
const MOVE_UP = 0;
const MOVE_RIGHT = 10;

class PacmanUI extends UIComponent {
  panelWidth = 1920;
  panelHeight = 1080;

  private origin: Vec3|undefined;

  private lives = 3;
  private livesBinding = new Binding<string[]>(["flex","flex","flex"])
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


  private pacman: Player|undefined;

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
  preStart() {
    this.connectNetworkBroadcastEvent(Events.resetGame, this.reset.bind(this));
    this.connectNetworkBroadcastEvent(Events.respawnPacman, this.loseLife.bind(this));
    this.connectNetworkBroadcastEvent(Events.setPacman, (payload: {pacMan: Player})=>{
      this.pacman = payload.pacMan
      this.entity.setVisibilityForPlayers([payload.pacMan],PlayerVisibilityMode.VisibleTo);});
    this.connectNetworkBroadcastEvent(Events.pacDotCollected, (payload: {pacDot: Entity})=>{
      this.hidePacDot(payload.pacDot);
    });
    this.connectNetworkBroadcastEvent(Events.fruitCollected, this.hideFruit.bind(this));
    this.connectNetworkBroadcastEvent(Events.fruitCollectable, this.showFruit.bind(this));
    this.connectNetworkBroadcastEvent(Events.powerPelletCollected, (payload: {powerPellet: Entity})=>{
      this.hidePowerPellet(payload.powerPellet);
    });
  }
  start() {
    this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);

    const originRef: Entity = this.props.trackingOrigin;
    this.origin = originRef.position.get();
    this.async.setTimeout(()=>{
      this.setItemPositions();
      this.async.setInterval(this.updatePlayerPositions.bind(this),100);
    },10_000);

    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerEnterWorld, ()=>{
      this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);
      if (this.pacman){
        this.entity.setVisibilityForPlayers([this.pacman],PlayerVisibilityMode.VisibleTo);
      }
    });

  }



  initializeUI(): UINode {
    const backgroundImage: ImageSource = ImageSource.fromTextureAsset(this.props.backgroundImage);
    const playerImage: ImageSource = ImageSource.fromTextureAsset(this.props.playerImage);
    const enemyImage: ImageSource = ImageSource.fromTextureAsset(this.props.enemyImage);
    const pacDotImage: ImageSource = ImageSource.fromTextureAsset(this.props.pacDotImage);
    const fruitImage: ImageSource = ImageSource.fromTextureAsset(this.props.fruitImage);
    const powerPelletImage: ImageSource = ImageSource.fromTextureAsset(this.props.powerPelletImage);


    this.pacDots = this.world.getEntitiesWithTags(["PacDot"], EntityTagMatchOperation.HasAnyExact);
    // console.log(this.pacDots.length, "PacDots");
    this.powerPellets = this.world.getEntitiesWithTags(["PowerPellet"], EntityTagMatchOperation.HasAnyExact);
    // console.log(this.powerPellets.length, "PowerPellets");
    this.fruits = this.world.getEntitiesWithTags(["fruit"], EntityTagMatchOperation.HasAnyExact);
    // console.log(this.fruits.length, "Fruit");

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
    this.fruitVisibility = Array(this.fruits.length).fill("none");
    this.fruitDisplayLocationsX.set(this.fruitLocationsX)
    this.fruitDisplayLocationsY.set(this.fruitLocationsY);
    this.fruitDisplayVisibility.set(this.fruitVisibility);





    this.pacDots.forEach((_:Entity, index:number) => {
      displayItems.push(Image({source: pacDotImage, style:{width: ICON_SIZE, height: ICON_SIZE, bottom: this.pacDotDisplayLocationsX.derive((numberArray)=>{
            return numberArray[index];
          }), left: this.pacDotDisplayLocationsY.derive((numberArray)=>{
            return numberArray[index];
          }), position: "absolute", zIndex: 1, display: this.pacDotDisplayVisibility.derive((numberArray)=>{
            return numberArray[index];
          })}}));
    });

    this.powerPellets.forEach((_:Entity, index:number) => {
      displayItems.push(Image({source: powerPelletImage, style:{width: ICON_SIZE, height: ICON_SIZE, bottom: this.powerPelletDisplayLocationsX.derive((numberArray)=>{
            return numberArray[index];
          }), left: this.powerPelletDisplayLocationsY.derive((numberArray)=>{
            return numberArray[index];
          }), position: "absolute", zIndex: 1, display: this.powerPelletDisplayVisibility.derive((numberArray)=>{
            return numberArray[index];
          })}}));
    });

    this.fruits.forEach((_:Entity, index:number) => {
      displayItems.push(Image({source: fruitImage, style:{width: ICON_SIZE, height: ICON_SIZE, bottom: this.fruitDisplayLocationsX.derive((numberArray)=>{
            return numberArray[index];
          }), left: this.fruitDisplayLocationsY.derive((numberArray)=>{
            return numberArray[index];
          }), position: "absolute", zIndex: 1, display: this.fruitDisplayVisibility.derive((numberArray)=>{
            return numberArray[index];
          })}}));
    });


    return View({
      children: [
          // miniMap
          View({
        children: [
          Image({
            source: backgroundImage,
            style: {width: "100%", height: "100%", top: 0, left: 0, position: "absolute", zIndex: -1, opacity: 0.5}
          }),
          Image({
            source: playerImage,
            style: {width: ICON_SIZE, height: ICON_SIZE, bottom: this.pacManX, left: this.pacManY, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: ICON_SIZE, height: ICON_SIZE, bottom: this.enemy1X, left: this.enemy1Y, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: ICON_SIZE, height: ICON_SIZE, bottom: this.enemy2X, left: this.enemy2Y, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: ICON_SIZE, height: ICON_SIZE, bottom: this.enemy3X, left: this.enemy3Y, position: "absolute", zIndex: 2}
          }),
          Image({
            source: enemyImage,
            style: {width: ICON_SIZE, height: ICON_SIZE, bottom: this.enemy4X, left: this.enemy4Y, position: "absolute", zIndex: 2}
          }),
          ...displayItems
        ], style: {position: "absolute", width: 384, height: 216, left: 100, top: "10%"}
      }),
      // life Indicator
          View({children: [
              Image({source: playerImage, style: {width: 80, height: 80, display: this.livesBinding.derive((value:string[])=>{return value[0]})}}),
              Image({source: playerImage, style: {width: 80, height: 80, display: this.livesBinding.derive((value:string[])=>{return value[1]})}}),
              Image({source: playerImage, style: {width: 80, height: 80, display: this.livesBinding.derive((value:string[])=>{return value[2]})}}),

            ], style:{width: "30%", height: 80, top: 0, left: "35%", position: "absolute", display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center"}})
      ], style: {width: "100%", height: "100%" ,position: "absolute"}
    })
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
    this.pacManY.set((pacPos.x + MOVE_RIGHT) as DimensionValue);
    this.pacManX.set((pacPos.z + MOVE_UP) as DimensionValue);
    this.enemy1Y.set((e1Pos.x + MOVE_RIGHT) as DimensionValue);
    this.enemy1X.set((e1Pos.z + MOVE_UP) as DimensionValue);
    this.enemy2Y.set((e2Pos.x + MOVE_RIGHT) as DimensionValue);
    this.enemy2X.set((e2Pos.z + MOVE_UP) as DimensionValue);
    this.enemy3Y.set((e3Pos.x + MOVE_RIGHT) as DimensionValue);
    this.enemy3X.set((e3Pos.z + MOVE_UP) as DimensionValue);
    this.enemy4Y.set((e4Pos.x + MOVE_RIGHT) as DimensionValue);
    this.enemy4X.set((e4Pos.z + MOVE_UP) as DimensionValue);


  }
  setItemPositions(){
    this.setPacDotLocations();
    this.setPowerPelletLocations();
    this.setFruitLocations();

  }
  setPacDotLocations(){
    this.pacDots = this.world.getEntitiesWithTags(["PacDot"], EntityTagMatchOperation.HasAnyExact);
    this.pacDots.forEach((dot: Entity, index: number)=>{
      const currentDotLocation = dot.position.get().sub(this.origin!).mul(MAP_UPSCALE);
      this.pacDotLocationsX[index] = currentDotLocation.z + MOVE_UP;
      this.pacDotLocationsY[index] = currentDotLocation.x + MOVE_RIGHT;
    });
    this.pacDotDisplayLocationsX.set(this.pacDotLocationsX);
    this.pacDotDisplayLocationsY.set(this.pacDotLocationsY);

  }
  setPowerPelletLocations(){
    this.powerPellets = this.world.getEntitiesWithTags(["PowerPellet"], EntityTagMatchOperation.HasAnyExact);

    this.powerPellets.forEach((pellet: Entity, index: number)=>{
      const currentPelletLocation = pellet.position.get().sub(this.origin!).mul(MAP_UPSCALE);
      this.powerPelletLocationsX[index] = currentPelletLocation.z + MOVE_UP;
      this.powerPelletLocationsY[index] = currentPelletLocation.x + MOVE_RIGHT;
    });
    this.powerPelletDisplayLocationsX.set(this.powerPelletLocationsX);
    this.powerPelletDisplayLocationsY.set(this.powerPelletLocationsY);
  }
  setFruitLocations(){
    this.fruits = this.world.getEntitiesWithTags(["fruit"], EntityTagMatchOperation.HasAnyExact);


    this.fruits.forEach((fruit: Entity, index: number)=>{
      const currentFruitLocation = fruit.position.get().sub(this.origin!).mul(MAP_UPSCALE);
      this.fruitLocationsX[index] = currentFruitLocation.z + MOVE_UP;
      this.fruitLocationsY[index] = currentFruitLocation.x + MOVE_RIGHT;
    });
    this.fruitDisplayLocationsX.set(this.fruitLocationsX);
    this.fruitDisplayLocationsY.set(this.fruitLocationsY);
  }

  hidePacDot(pacDot: Entity) {
    const index = this.pacDots.indexOf(pacDot);
    console.log("The pacDot was found at" ,index);
    this.pacDotVisibility[index] = "none";
    this.pacDotDisplayVisibility.set(this.pacDotVisibility);
  }
  hideFruit() {
    this.fruitVisibility[0] = "none";
    this.fruitDisplayVisibility.set(this.fruitVisibility);
  }
  showFruit(){
    this.fruitVisibility[0] = "flex";
    this.fruitDisplayVisibility.set(this.fruitVisibility);
  }
  hidePowerPellet(powerPellet: Entity) {
    const index = this.powerPellets.indexOf(powerPellet);
    this.powerPelletVisibility[index] = "none";
    this.powerPelletDisplayVisibility.set(this.powerPelletVisibility);
  }
  reset(){
    this.lives = 3;
    this.pacman = undefined;
    this.updateLivesDisplay();
    this.showAll();

  }
  private loseLife(){
    this.lives -= 1;
    console.log("The customUI is losing a life. The current lives are", this.lives);
    this.updateLivesDisplay();
  }
  private updateLivesDisplay(){
    switch (this.lives) {
      case 3:
        this.livesBinding.set(["flex", "flex", "flex"]);
        break;
      case 2:
        this.livesBinding.set(["flex", "flex", "none"]);
        break;
      case 1:
        this.livesBinding.set(["flex", "none", "none"]);
        break;
        default:
          this.livesBinding.set(["none", "none", "none"]);
          break;
    }
  }
  showAll(){
    this.entity.setVisibilityForPlayers(this.world.getPlayers(), PlayerVisibilityMode.HiddenFrom);
    this.pacDotVisibility = Array(this.pacDots.length).fill("flex");
    this.pacDotDisplayVisibility.set(this.pacDotVisibility);

    this.powerPelletVisibility = Array(this.powerPellets.length).fill("flex");
    this.powerPelletDisplayVisibility.set(this.powerPelletVisibility);

    this.fruitVisibility = Array(this.fruits.length).fill("none");
    this.fruitDisplayVisibility.set(this.fruitVisibility);

  }

}
Component.register(PacmanUI);