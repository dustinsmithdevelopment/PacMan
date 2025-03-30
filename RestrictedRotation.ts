const INPUT_TOLERANCE = 0.2;

import {
  ButtonIcon, CodeBlockEvents,
  Component,
  EventSubscription,
  Player,
  PlayerControls,
  PlayerDeviceType,
  PlayerInput,
  PlayerInputAction, PropTypes, Quaternion, radiansToDegrees, Vec3
} from "horizon/core";

export abstract class RestrictedRotation extends Component {
  static propsDefinition = {};
  private owner: Player | undefined;
  private rotation = 0;

  start() {

  }
  protected restrictRotation(p: Player) {
    this.rotation = 0;
    this.owner = p;
    this.assignRotation();
    this.configureControls();
  }
  private forward_input?: PlayerInput;
  private turn_input?: PlayerInput;
  private configureControls() {
    if (this.owner!.deviceType.get() == PlayerDeviceType.VR){
      // VR
      console.log("Restricting rotation in VR for " + this.owner!.name.get());
      this.forward_input = PlayerControls.connectLocalInput(PlayerInputAction.LeftYAxis, ButtonIcon.None, this);
      this.forward_input.registerCallback((_, pressed) => {
        if (pressed && this.forward_input!.axisValue.get() < 0){
          this.reverse();
        }
      })
      this.turn_input = PlayerControls.connectLocalInput(PlayerInputAction.RightXAxis, ButtonIcon.None, this);
      this.turn_input.registerCallback((_, pressed) => {
        if (pressed){
          if (this.turn_input!.axisValue.get() > (INPUT_TOLERANCE)) {
            this.rotateRight();
          }else if (this.turn_input!.axisValue.get() < (-INPUT_TOLERANCE)){
            this.rotateLeft();
          }
        }
      });
    }else if (this.owner!.deviceType.get() == PlayerDeviceType.Desktop){
      console.log("Restricting rotation on Desktop for " + this.owner!.name.get());
      this.forward_input = PlayerControls.connectLocalInput(PlayerInputAction.LeftYAxis, ButtonIcon.None, this);
      this.forward_input.registerCallback((_, pressed) => {
        if (pressed && this.forward_input!.axisValue.get() < 0){
          this.reverse();
        }
      })
      this.turn_input = PlayerControls.connectLocalInput(PlayerInputAction.LeftXAxis, ButtonIcon.None, this);
      this.turn_input.registerCallback((_, pressed) => {
        if (pressed){
          if (this.turn_input!.axisValue.get() > 0) {
            this.rotateRight();
          }else if (this.turn_input!.axisValue.get() < 0){
            this.rotateLeft();
          }
        }
      });
    }else if (this.owner!.deviceType.get() == PlayerDeviceType.Mobile){
      // TODO mobile assignment
      PlayerControls.disableSystemControls();
    }
  }
  private rotateRight(){
    this.rotation = (this.rotation + 90) % 360;
    this.assignRotation();
  }
  private rotateLeft(){
    this.rotation = (this.rotation - 90) % 360;
    this.assignRotation();
  }
  private reverse(){
    this.rotation = (this.rotation - 180) % 360;
    this.assignRotation();
  }
  private assignRotation(){
    const targetQuaternion = Quaternion.fromEuler(new Vec3(0,this.rotation, 0));
    this.async.setTimeout(()=>{
      this.owner!.rootRotation.set(targetQuaternion);
    },100);
  }
  protected unrestrictRotation(p: Player) {
    console.log("Removing rotation restriction for " + this.owner!.name.get());
    if (this.entity.owner.get().deviceType.get() == PlayerDeviceType.VR || this.entity.owner.get().deviceType.get() == PlayerDeviceType.Desktop){
      // VR
      this.forward_input?.unregisterCallback();
      this.turn_input?.unregisterCallback();
      this.forward_input?.disconnect();
      this.turn_input?.disconnect();


    }else if (this.entity.owner.get().deviceType.get() == PlayerDeviceType.Mobile){
      // TODO mobile unassignment
      PlayerControls.enableSystemControls();
      
    }
  }

}