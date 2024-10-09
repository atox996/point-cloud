import { ActionName } from "./enum";

export default abstract class Action {
  static actionName: ActionName;

  enabled = true;

  constructor() {
    const subclass = this.constructor as typeof Action;
    if (!ActionName[subclass.actionName]) {
      console.error(
        new Error(
          "Subclass must implement the static property 'actionName' as a value from the ActionName enum.",
        ),
      );
    }
  }

  abstract init(): void;

  abstract destroy(): void;

  toggle(enabled?: boolean) {
    this.enabled = enabled === undefined ? !this.enabled : enabled;
  }
}
