export default abstract class Action {
  enabled = true;

  abstract init(): void;

  abstract destroy(): void;

  toggle(enabled?: boolean) {
    this.enabled = enabled === undefined ? !this.enabled : enabled;
  }
}
