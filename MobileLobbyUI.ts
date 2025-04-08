import {
  Component,
  Entity,
  Player,
  PlayerControls,
  PlayerVisibilityMode,
  PropTypes,
  SpawnPointGizmo
} from "horizon/core";
import {Events} from "./GameUtilities";
import {Pressable, Text, UIComponent, UINode, View} from "horizon/ui";
import {PlayerCameraEvents} from "./PlayerCamera";
import {Easing} from "horizon/camera";


class PlayerScreen extends UIComponent {
  panelWidth = 1920;
  panelHeight = 1080;


  static propsDefinition = {
    playerManager: {type: PropTypes.Entity},
    firstPersonSpawn: {type: PropTypes.Entity},
    thirdPersonSpawn: {type: PropTypes.Entity},
    cameraPositionEntity: {type: PropTypes.Entity},
  };
  initializeUI(): UINode {
    return View({children:[
        View({style: {height: 66, width: "60%", marginLeft: "20%", marginRight: "20%", marginTop: 15, position: 'absolute', display: "flex", justifyContent: "space-around", flexDirection: "row"}, children:[
            Pressable({style: {backgroundColor: "#00796B", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: (p: Player)=>{
              const spawnEntity: Entity = this.props.firstPersonSpawn;
              spawnEntity.as(SpawnPointGizmo).teleportPlayer(p);
              }, children: [
                Text({text: "First-Person View", style: {height: "100%" ,color: "white", textAlign: "center", fontSize: 24, textAlignVertical: "center", fontWeight: "bold"}},)
              ]}),
            Pressable({style: {backgroundColor: "#0288D1", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: (p: Player)=>{
                const spawnEntity: Entity = this.props.thirdPersonSpawn;
                spawnEntity.as(SpawnPointGizmo).teleportPlayer(p);
              }, children: [
                Text({text: "Third-Person View", style: {height: "100%" ,color: "white", textAlign: "center", fontSize: 24, textAlignVertical: "center", fontWeight: "bold"}},)
              ]}),
            Pressable({style: {backgroundColor: "#455A64", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: (p: Player)=>{
                if (this.props.cameraPositionEntity !== undefined && this.props.cameraPositionEntity !== null) {
                  this.sendNetworkEvent(p, PlayerCameraEvents.SetCameraFixedPositionWithEntity, { entity: this.props.cameraPositionEntity, duration: 0.4, easing: Easing.EaseInOut});
                  this.entity.setVisibilityForPlayers([p], PlayerVisibilityMode.HiddenFrom);
                } else {
                  console.warn("Attempted to use FixedCameraTrigger without a camera position entity. Create an empty object and reference it in the props.")
                }
              }, children: [
                Text({text: "Floating View", style: {height: "100%" ,color: "#ECEFF1", textAlign: "center", fontSize: 24, textAlignVertical: "center", fontWeight: "bold"}},)
              ]})
          ]}),
          View({children:[
              Pressable({style: {backgroundColor: "#455A64", borderRadius: 12, borderColor: "black", borderWidth: 4, height: 80}, onClick: (player: Player)=>{
                  this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue1, {player: player});
                }, children: [
                  Text({text: "Join Queue 1", style: {color: "#00BCD4", height: "100%", textAlign: "center", textAlignVertical: "center", fontSize: 32, fontWeight: "bold"}},)
                ]}),
              Pressable({style: {backgroundColor: "#455A64", borderRadius: 12, borderColor: "black", borderWidth: 4, height: 80}, onClick: (player: Player)=>{
                  this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue2, {player: player});
                }, children: [
                  Text({text: "Join Queue 2", style: {color: "#00BCD4", height: "100%", textAlign: "center", textAlignVertical: "center", fontSize: 32, fontWeight: "bold"}},)
                ]})
            ], style: {position: "absolute",width: 220, height: 180, right: 10, bottom: 10, display: "flex", flexDirection: "column", justifyContent: "space-between"}}),

      ], style: {position: "absolute", width: "100%", height: "100%"}});
  }



  preStart() {
    this.connectNetworkEvent(this.entity, Events.assignPlayer, (payload: {player: Player}) => {this.assignPlayer(payload.player)});
    this.connectNetworkEvent(this.entity, Events.unassignPlayer, ()=>{this.unassignPlayer()});
  }
  start() {

  }
  assignPlayer(p: Player) {
    console.log("Assignment requested to Mobile Lobby UI for", p.name.get());
    this.entity.owner.set(p);
    PlayerControls.disableSystemControls();
    this.connectNetworkEvent(p, PlayerCameraEvents.OnCameraResetPressed, ()=>{this.entity.resetVisibilityForPlayers();})
  }
  unassignPlayer() {
    PlayerControls.enableSystemControls();
    this.entity.owner.set(this.world.getServerPlayer());
  }

}
Component.register(PlayerScreen);