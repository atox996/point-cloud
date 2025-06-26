import { Raycaster, Vector2 } from "three";

import Box3D from "../common/objects/Box3D";
import Action from "./Action";

const _pos = new Vector2();

export default class SelectAction extends Action {
  private _mouseDown = false;

  private _mouseDownPos = new Vector2();

  private raycaster = new Raycaster();

  onPointerDown = (event: PointerEvent) => {
    if (!this.enabled || event.button !== 2) return;
    this._mouseDown = true;
    this._mouseDownPos.set(event.offsetX, event.offsetY);
  };

  onPointerUp = (event: PointerEvent) => {
    if (!this.enabled) return;
    const tempVec2 = new Vector2();
    const distance = tempVec2.set(event.offsetX, event.offsetY).distanceTo(this._mouseDownPos);
    if (this._mouseDown && distance < 10) {
      const object = this.getObject(event);
      if (object) {
        this.viewer.shareScene.selectObject(object);
      }
    }
    this._mouseDown = false;
  };

  init(): void {
    this._mouseDown = false;
    this._mouseDownPos = new Vector2();
    const { container } = this.viewer;
    container.addEventListener("pointerdown", this.onPointerDown);
    container.addEventListener("pointerup", this.onPointerUp);
  }

  dispose(): void {
    const { container } = this.viewer;
    container.removeEventListener("pointerdown", this.onPointerDown);
    container.removeEventListener("pointerup", this.onPointerUp);
  }

  getObject(event: MouseEvent) {
    this.updateProjectPos(event);
    const annotate3D = this.viewer.shareScene.getAnnotations3D();

    this.raycaster.setFromCamera(_pos, this.viewer.camera);
    const intersects = this.raycaster.intersectObjects<Box3D>(annotate3D);
    if (intersects.length > 0) return intersects[0].object;
  }

  updateProjectPos(event: MouseEvent) {
    const x = (event.offsetX / this.viewer.width) * 2 - 1;
    const y = (-event.offsetY / this.viewer.height) * 2 + 1;
    _pos.set(x, y);
  }
}
