import { UIComponent, Pressable } from "horizon/ui"

class StartNowButton extends UIComponent<typeof StartNowButton> {
  static propsDefinition = {};

  preStart() {
    super.preStart();
  }
  initializeUI(): UINode {
    return Pressable({});
  }

  start() {

  }
}
UIComponent.register(StartNowButton);