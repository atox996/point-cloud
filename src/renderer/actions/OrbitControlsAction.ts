import { OrbitControls } from "three/examples/jsm/Addons.js";
import type Viewer from "../views/Viewer";
import Action from "./Action";
import { ActionName } from "./enum";

export default class OrbitControlsAction extends Action {
  static actionName = ActionName.OrbitControls;
  viewer: Viewer;
  controller: OrbitControls;

  constructor(viewer: Viewer) {
    super();

    this.viewer = viewer;

    this.controller = new OrbitControls(
      viewer.camera,
      viewer.renderer.domElement,
    );
    this.controller.addEventListener("change", () => {
      viewer.render();
    });
  }

  init(): void {}

  destroy(): void {
    this.controller.dispose();
  }

  toggle(enabled?: boolean): void {
    super.toggle(enabled);
    this.controller.enabled = this.enabled;
  }
}
