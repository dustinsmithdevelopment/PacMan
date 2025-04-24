import * as hz from 'horizon/core';

class MoveOverTime extends hz.Component<typeof MoveOverTime> {
  static propsDefinition = {
    targetPosition: {type: hz.PropTypes.Vec3},
    duration: {type: hz.PropTypes.Number, default: 1},
  };

  private startPosition!: hz.Vec3;
  private startTime!: number;

  start() {
    if (this.props.targetPosition! && this.props.duration!) {
      this.startPosition = this.entity.position.get();
      this.startTime = Date.now();
      this.connectLocalBroadcastEvent(hz.World.onUpdate, (data: {deltaTime: number}) => this.update(data.deltaTime));
    }
  }

  update(deltaTime: number) {
    const timeElapsed = (Date.now() - this.startTime) / 1000;
    if (timeElapsed >= this.props.duration!) return;

    const percentComplete = timeElapsed / this.props.duration!;
    const currentPosition = hz.Vec3.lerp(this.startPosition, this.props.targetPosition!, percentComplete);
    this.entity.position.set(currentPosition);
  }
}
hz.Component.register(MoveOverTime);