import { LineSegments, Color, Object3D, PerspectiveCamera } from "three";
import type PointCloud from "../PointCloud";
import Viewer from "./Viewer";
import { ActionName } from "../actions";

const defaultActions = [ActionName.Create, ActionName.OrbitControls];

export default class MainViewer extends Viewer {
  camera: PerspectiveCamera;

  activeBox: Object3D | null = null;

  constructor(container: HTMLElement, pointCloud: PointCloud) {
    super(container, pointCloud);

    this.camera = new PerspectiveCamera(35, this.width / this.height, 1, 30000);

    this.camera.position.set(0, 0, 100);
    this.camera.up.copy(this.pointCloud.up);
    this.camera.lookAt(0, 0, 0);

    this.setActions(defaultActions);

    this.resize();

    this.initEvent();
  }

  initEvent() {
    this.pointCloud.addEventListener("select", (ev) => {
      const obj = ev.selection.findLast((o) => o instanceof Object3D);
      if (obj) {
        this.focalized(obj);
      } else {
        this.activeBox = null;
      }
      this.render();
    });
  }

  resize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    super.resize();
  }

  focalized(activeBox?: Object3D) {
    if (activeBox) this.activeBox = activeBox;
    else if (this.activeBox) activeBox = this.activeBox;
    if (!activeBox) return;
    console.log(activeBox);
  }

  render() {
    this.pointCloud.points.material.activeMode = "highlight";
    this.pointCloud.points.material.activeBoxes = this.pointCloud.selection.map(
      (o) => {
        const box = o as LineSegments;
        if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();
        return {
          bbox: box.geometry.boundingBox!,
          matrix: o.matrixWorld.clone().invert(),
          color: new Color(0xff0000),
          opacity: 0.5,
        };
      },
    );

    super.render();
  }
}
