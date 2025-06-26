import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import Viewer from "../views/Viewer";
import Action from "./Action";

export default class OrbitControlsAction extends Action {
  controller: OrbitControls;

  constructor(viewer: Viewer) {
    super(viewer);

    this.controller = new OrbitControls(viewer.camera, viewer.renderer.domElement);
    this.controller.enableRotate = viewer.isPerspectiveViewer;
    this.controller.addEventListener("change", () => viewer.render());
  }

  focus(pos = new Vector3()) {
    this.controller.target.copy(pos);
  }

  toggle(enabled?: boolean): void {
    super.toggle(enabled);
    this.controller.enabled = this.enabled;
  }

  onSelect = () => {
    const { selection } = this.viewer.shareScene;
    const object = selection.at(-1);
    if (object) {
      this.focus(object.position);
    }
  };

  init(): void {
    this.viewer.shareScene.addEventListener("select", this.onSelect);
  }

  dispose(): void {
    this.viewer.shareScene.removeEventListener("select", this.onSelect);
    this.controller.dispose();
  }
}
