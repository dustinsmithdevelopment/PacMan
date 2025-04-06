import {
  ButtonIcon,
  Component,
  Player,
  PlayerControls,
  PlayerInput,
  PlayerInputAction,
  TextureAsset,
  CodeBlockEvents,
  PropTypes,
  LocalEvent, Entity
} from "horizon/core";
import {Events} from "./GameUtilities";
import {UIComponent, UINode, View, ImageSource, Image, Pressable, Text} from "horizon/ui";






class PlayerScreen extends UIComponent {
  panelWidth = 1920;
  panelHeight = 1080;


  static propsDefinition = {

  };
  initializeUI(): UINode {
    return View({children:[
        View({style: {height: 66, width: "60%", marginLeft: "20%", marginRight: "20%", marginTop: 15, position: 'absolute', display: "flex", justifyContent: "space-around", flexDirection: "row"}, children:[
            Pressable({style: {backgroundColor: "#00796B", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: ()=>{}, children: [
                Text({text: "First-Person View", style: {height: "100%" ,color: "white", textAlign: "center", fontSize: 24, textAlignVertical: "center", fontWeight: "bold"}},)
              ]}),
            Pressable({style: {backgroundColor: "#0288D1", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: ()=>{}, children: [
                Text({text: "Third-Person View", style: {height: "100%" ,color: "white", textAlign: "center", fontSize: 24, textAlignVertical: "center", fontWeight: "bold"}},)
              ]}),
            Pressable({style: {backgroundColor: "#455A64", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: ()=>{}, children: [
                Text({text: "Floating View", style: {height: "100%" ,color: "#ECEFF1", textAlign: "center", fontSize: 24, textAlignVertical: "center", fontWeight: "bold"}},)
              ]})
          ]}),
        Pressable({style: {position: "absolute",width: 220, height: 180, right: 10, bottom: 10, backgroundColor: "#455A64", borderRadius: 12, borderColor: "black", borderWidth: 4}, onClick: ()=>{}, children: [
            Text({text: "Join Game", style: {color: "#00BCD4", textAlign: "center", fontSize: 64, textAlignVertical: "center", fontWeight: "bold"}},)
          ]})
      ], style: {position: "absolute", width: "100%", height: "100%"}});
  }



  preStart() {
    this.connectNetworkEvent(this.entity, Events.assignPlayer, (payload: {player: Player}) => {this.assignPlayer(payload.player)});
    this.connectNetworkEvent(this.entity, Events.unassignPlayer, ()=>{this.unassignPlayer()})
  }
  start() {

  }
  assignPlayer(p: Player) {
    this.entity.owner.set(p);
    PlayerControls.disableSystemControls();

  }
  unassignPlayer() {
    PlayerControls.enableSystemControls();
    this.entity.owner.set(this.world.getServerPlayer());
  }

}
Component.register(PlayerScreen);