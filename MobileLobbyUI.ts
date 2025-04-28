import {Component, EventSubscription, Player, PlayerVisibilityMode, PropTypes, SerializableState} from "horizon/core";
import {Events} from "./GameUtilities";
import {Binding, Pressable, Text, UIComponent, UINode, View} from "horizon/ui";
import {PlayerCameraEvents} from "./PlayerCamera";
import {CameraMode, Easing} from "horizon/camera";
import {MobileUIManagerEvents} from "./MobileUIManager";


class PlayerScreen extends UIComponent {
  panelWidth = 1920;
  panelHeight = 1080;

  private inQueue1 = false;
  private inQueue2 = false;
  private queue1Full = false;
  private queue2Full = false;

  private endFloatingViewEvent: EventSubscription|undefined;
  private hideLobbyUIEvent: EventSubscription|undefined;
  private showLobbyUIEvent: EventSubscription|undefined;

  private wearer: Player|undefined;

  private queue1Binding: Binding<string> = new Binding("Join Next Game");
  private queue2Binding: Binding<string> = new Binding("Join Queue 2");





  static propsDefinition = {
    playerManager: {type: PropTypes.Entity},
    cameraPositionEntity: {type: PropTypes.Entity},
  };
  initializeUI(): UINode {
    return View({children:[
        View({style: {height: 66, width: "60%", marginLeft: "20%", marginRight: "20%", marginTop: 15, position: 'absolute', display: "flex", justifyContent: "space-around", flexDirection: "row"}, children:[
            Pressable({style: {backgroundColor: "#00796B", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: (p: Player)=>{
                this.sendNetworkEvent(p, PlayerCameraEvents.SetCameraMode, {mode: CameraMode.FirstPerson});
              }, children: [
                Text({text: "First-Person View", style: {height: "100%" ,color: "white", textAlign: "center", fontSize: 24, textAlignVertical: "center", fontWeight: "bold"}},)
              ]}),
            Pressable({style: {backgroundColor: "#0288D1", height: 58, width: 220, borderRadius: 12, borderColor: "black", borderWidth: 2}, onClick: (p: Player)=>{
                this.sendNetworkEvent(p, PlayerCameraEvents.SetCameraMode, {mode: CameraMode.ThirdPerson});
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
              Pressable({style: {backgroundColor: "#455A64", borderRadius: 24, borderColor: "black", borderWidth: 4, height: 160}, onClick: (player: Player)=>{
                  if (!this.inQueue1) {
                    this.sendNetworkEvent(this.props.playerManager!, Events.joinQueue1, {player: player});
                  }else {
                    this.sendNetworkEvent(this.props.playerManager!, Events.leaveQueue1, {player: player});
                  }
                }, children: [
                  Text({text: this.queue1Binding, style: {color: "#00BCD4", height: "100%", textAlign: "center", textAlignVertical: "center", fontSize: 32, fontWeight: "bold"}},)
                ]})
            ], style: {position: "absolute",width: 220, height: 180, right: 10, bottom: 10, display: "flex", flexDirection: "column", justifyContent: "space-between"}}),

      ], style: {position: "absolute", width: "100%", height: "100%"}});
  }



  preStart() {
    this.connectNetworkBroadcastEvent(Events.updatePlayersInQueue, (payload: {queue1: Player[], queue2: Player[]}) => {
      this.updatePlayerStatuses(payload.queue1, payload.queue2);
    });
  }
  start() {
    this.sendNetworkBroadcastEvent(MobileUIManagerEvents.OnRegisterMobileUI, {ObjectId: "PlayerMobileUI", Object: this.entity});

  }
  cancelEvent(event: EventSubscription|undefined) {
    if (event){
      event.disconnect();
    }
    return undefined;
  }
  transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
    this.endFloatingViewEvent = this.cancelEvent(this.endFloatingViewEvent);
    this.hideLobbyUIEvent = this.cancelEvent(this.hideLobbyUIEvent);
    this.showLobbyUIEvent = this.cancelEvent(this.showLobbyUIEvent);
    return super.transferOwnership(_oldOwner, _newOwner);
  }


  receiveOwnership(_serializableState: SerializableState, _oldOwner: Player, _newOwner: Player): void {
    if (_newOwner !== this.world.getServerPlayer()) {
      this.wearer = _newOwner;
      this.endFloatingViewEvent = this.connectNetworkEvent(_newOwner, PlayerCameraEvents.OnCameraResetPressed, ()=>{
        this.entity.setVisibilityForPlayers([_newOwner], PlayerVisibilityMode.VisibleTo);
      });
      this.hideLobbyUIEvent = this.connectNetworkEvent(_newOwner, Events.hideLobbyUI, ()=>{
        this.entity.setVisibilityForPlayers([_newOwner], PlayerVisibilityMode.HiddenFrom);
      });
      this.showLobbyUIEvent = this.connectNetworkEvent(_newOwner, Events.showLobbyUI, ()=>{
        this.entity.setVisibilityForPlayers([_newOwner], PlayerVisibilityMode.VisibleTo);
      });
    }
  }

  private updatePlayerStatuses(queue1: Player[], queue2: Player[]): void {
    if(this.wearer){
      this.inQueue1 = queue1.includes(this.wearer);
      this.inQueue2 = queue2.includes(this.wearer);
    }
    this.queue1Full = (queue1.length >= 5);
    this.queue2Full = (queue2.length >= 5);
    this.updatePlayerDisplay();
  }
  private updatePlayerDisplay() {
    let queue1text = "";
    let queue2text = "";

    if (this.inQueue1) {
      queue1text = "Leave Next Game";
    } else if (this.queue1Full) {
      queue1text = "Next Game Full";
    } else {
      queue1text = "Join Next Game";
    }

    if (this.inQueue2) {
      queue2text = "Leave Queue 2";
    } else if (this.queue2Full) {
      queue2text = "Queue 2 Full";
    } else {
      queue2text = "Join Queue 2";
    }

    this.queue1Binding.set(queue1text);
    this.queue2Binding.set(queue2text);

  }












}
Component.register(PlayerScreen);