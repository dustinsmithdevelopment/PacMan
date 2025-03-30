const INPUT_TOLERANCE = 0.2;

import {
  ButtonIcon, CodeBlockEvents,
  Component,
  EventSubscription,
  Player,
  PlayerControls,
  PlayerDeviceType,
  PlayerInput,
  PlayerInputAction, Quaternion, radiansToDegrees, Vec3
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
  private VR_forward_input?: PlayerInput;
  private VR_turn_input?: PlayerInput;
  private Desktop_forward_input?: PlayerInput;
  private Desktop_turn_input?: PlayerInput;
  private configureControls() {
    if (this.owner!.deviceType.get() == PlayerDeviceType.VR){
      // VR
      console.log("Restricting rotation in VR for " + this.owner!.name.get());
      this.VR_forward_input = PlayerControls.connectLocalInput(PlayerInputAction.LeftYAxis, ButtonIcon.None, this);
      this.VR_forward_input.registerCallback((_, pressed) => {
        if (pressed && this.VR_forward_input!.axisValue.get() < 0){
          this.reverse();
        }
      })
      this.VR_turn_input = PlayerControls.connectLocalInput(PlayerInputAction.RightXAxis, ButtonIcon.None, this);
      this.VR_turn_input.registerCallback((_, pressed) => {
        if (pressed){
          if (this.VR_turn_input!.axisValue.get() > (INPUT_TOLERANCE)) {
            this.rotateRight();
          }else if (this.VR_turn_input!.axisValue.get() < (-INPUT_TOLERANCE)){
            this.rotateLeft();
          }
        }
      });
    }else if (this.owner!.deviceType.get() == PlayerDeviceType.Desktop){
      console.log("Restricting rotation on Desktop for " + this.owner!.name.get());
      this.Desktop_forward_input = PlayerControls.connectLocalInput(PlayerInputAction.LeftYAxis, ButtonIcon.None, this);
      this.Desktop_forward_input.registerCallback((_, pressed) => {
        if (pressed && this.Desktop_forward_input!.axisValue.get() < 0){
          this.reverse();
        }
      })
      this.Desktop_turn_input = PlayerControls.connectLocalInput(PlayerInputAction.RightXAxis, ButtonIcon.None, this);
      this.Desktop_turn_input.registerCallback((_, pressed) => {
        if (pressed){
          if (this.Desktop_turn_input!.axisValue.get() > (INPUT_TOLERANCE)) {
            this.rotateRight();
          }else if (this.Desktop_turn_input!.axisValue.get() < (-INPUT_TOLERANCE)){
            this.rotateLeft();
          }
        }
      });


    }else if (this.owner!.deviceType.get() == PlayerDeviceType.Mobile){}
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
    if (this.entity.owner.get().deviceType.get() == PlayerDeviceType.VR){
      // VR
      this.VR_forward_input?.unregisterCallback();
      this.VR_turn_input?.unregisterCallback();
      this.VR_forward_input?.disconnect();
      this.VR_turn_input?.disconnect();

    }else if (this.entity.owner.get().deviceType.get() == PlayerDeviceType.Desktop){
      // Desktop
      this.Desktop_forward_input?.unregisterCallback();
      this.Desktop_turn_input?.unregisterCallback();
      this.Desktop_forward_input?.disconnect();
      this.Desktop_turn_input?.disconnect();
    }else if (this.entity.owner.get().deviceType.get() == PlayerDeviceType.Mobile){
      // Mobile
      
    }
  }

}