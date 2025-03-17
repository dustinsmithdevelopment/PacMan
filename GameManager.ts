import {Component} from "horizon/core";

class GameManager extends Component<typeof GameManager> {
  static propsDefinition = {};
  private dotsRemaining = 0;
  private points = 0;
  private lives = 3;

  start() {

  }
}
Component.register(GameManager);