const INPUT_TOLERANCE = 0.2;

import {
  ButtonIcon,
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
  private VR_forward_input?: PlayerInput;
  private VR_turn_input?: PlayerInput;
  private rotation = 0;

  start() {

  }
  protected restrictRotation(p: Player) {
    this.rotation = 0;
    this.owner = p;
    this.assignRotation();
    if (this.entity.owner.get().deviceType.get() == PlayerDeviceType.VR){
      // VR
      console.log("Restricting rotation in VR for " + this.owner.name.get());
      this.VR_forward_input = PlayerControls.connectLocalInput(PlayerInputAction.RightYAxis, ButtonIcon.None, this);
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
      })
    }else {
      // Desktop or mobile

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
    },250);
  }
  protected unrestrictRotation(p: Player) {
    console.log("Removing rotation restriction for " + this.owner!.name.get());
    if (this.entity.owner.get().deviceType.get() == PlayerDeviceType.VR){
      // VR
      this.VR_forward_input?.unregisterCallback();
      this.VR_turn_input?.unregisterCallback();
      this.VR_forward_input?.disconnect();
      this.VR_turn_input?.disconnect();

    }else {
      // Desktop or mobile

    }
  }

}