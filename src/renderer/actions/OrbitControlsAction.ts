import { OrbitControls } from "three/examples/jsm/Addons.js";
import type Viewer from "../views/Viewer";
import Action from "./Action";

export default class OrbitControlsAction extends Action {
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
