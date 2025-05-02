import {Player, Component, Color, PropTypes, Vec3, World, Entity} from "horizon/core";

enum Positions{
  UP,
  CENTER,
  DOWN,
}

class Bounce extends Component<typeof Bounce> {
  static propsDefinition = {
    objectToMove: {type: PropTypes.Entity},
    offset: {type: PropTypes.Vec3},
    time: {type: PropTypes.Number},
  };
  private initialPosition!: Vec3;


  private objectToMove!: Entity;
  private targetPosition: Positions = Positions.CENTER;

  start() {
    this.objectToMove = this.props.objectToMove!;
    this.initialPosition = this.objectToMove.position.get();
    this.async.setInterval(this.handleNextMovement.bind(this), this.props.time*1000);
  }
  handleNextMovement(){
    this.targetPosition = (this.targetPosition+1)%3;
    switch (this.targetPosition) {
      case Positions.DOWN:
        this.moveOverTime(this.initialPosition.sub(this.props.offset), this.props.time);
        break;
      case Positions.UP:
        this.moveOverTime(this.initialPosition.add(this.props.offset), this.props.time);
        break;
      case Positions.CENTER:
        this.moveOverTime(this.initialPosition, this.props.time);
        break;
    }
  }

  moveOverTime(targetPosition: Vec3, seconds: number): void {
    const start = this.props.objectToMove!.position.get();
    const startTime = Date.now();
    const motion = this.connectLocalBroadcastEvent(World.onUpdate, (data: { deltaTime: number }) => this.update(data.deltaTime, start, targetPosition, startTime, seconds));
    this.async.setTimeout(() => {
      motion.disconnect();
    }, 1000 * seconds);
  }

  update(deltaTime: number, startPosition: Vec3, targetPosition: Vec3, startTime: number, duration: number): void {
    const timeElapsed = (Date.now() - startTime) / 1000;
    if (timeElapsed >= duration!) return;

    const percentComplete = timeElapsed / duration!;
    const currentPosition = Vec3.lerp(startPosition, targetPosition, percentComplete);
    this.objectToMove.position.set(currentPosition);
  }
}
Component.register(Bounce);