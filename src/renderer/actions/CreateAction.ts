import { SelectionBox, SelectionHelper } from "three/examples/jsm/Addons.js";
import type Viewer from "../views/Viewer";
import Action from "./Action";
import { Vector3 } from "three";

export default class CreateAction extends Action {
  viewer: Viewer;
  selectionBox: SelectionBox;
  selectionHelper: SelectionHelper;

  constructor(viewer: Viewer) {
    super();

    this.viewer = viewer;

    this.selectionBox = new SelectionBox(
      viewer.camera,
      viewer.shareScene.scene,
    );
    this.selectionHelper = new SelectionHelper(viewer.renderer, "selectBox");
    // 创建新的样式规则
    const style = document.createElement("style");
    style.textContent =
      ".selectBox { border: 1px solid #55aaff; background-color: #55aaff4d; position: fixed; }";
    document.head.appendChild(style);
  }

  init() {
    this.viewer.container.addEventListener("pointerdown", this.onPointerDown);
  }

  destroy() {
    this.viewer.container.removeEventListener(
      "pointerdown",
      this.onPointerDown,
    );

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  }

  toggle(enabled?: boolean): void {
    super.toggle(enabled);
    this.selectionHelper.enabled = this.enabled;
  }

  getPoint(ev: PointerEvent) {
    return new Vector3(
      (ev.clientX / this.viewer.width) * 2 - 1,
      -(ev.clientY / this.viewer.height) * 2 + 1,
      0,
    );
  }

  onPointerDown = (ev: PointerEvent) => {
    if (!this.enabled) return;
    this.selectionBox.startPoint.copy(this.getPoint(ev));

    document.addEventListener("pointermove", this.onPointerMove);

    document.addEventListener("pointerup", this.onPointerUp);
  };

  onPointerMove = (ev: PointerEvent) => {
    if (this.selectionHelper.isDown) {
      this.selectionBox.endPoint.copy(this.getPoint(ev));
    }
  };

  onPointerUp = (ev: PointerEvent) => {
    this.selectionBox.endPoint.copy(this.getPoint(ev));

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    this.selectionBox.select();
    console.log(this.selectionBox);
    console.log(this.selectionHelper);
  };
}
