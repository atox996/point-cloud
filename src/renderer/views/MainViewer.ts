import {
  LineSegments,
  Color,
  Object3D,
  PerspectiveCamera,
  type Vector3Like,
} from "three";
import type PointCloud from "../PointCloud";
import Viewer from "./Viewer";
import { ActionName } from "../actions";
import type { Box3D } from "../typings";

interface ViewerConfig {
  up?: Vector3Like;
}

const defaultActions = [ActionName.Create, ActionName.OrbitControls];

export default class MainViewer extends Viewer {
  config: ViewerConfig;

  camera: PerspectiveCamera;

  activeBox?: Box3D;

  constructor(
    container: HTMLElement,
    pointCloud: PointCloud,
    config?: Partial<ViewerConfig>,
  ) {
    super(container, pointCloud);

    this.config = {
      ...config,
    };

    this.camera = new PerspectiveCamera(35, this.width / this.height, 1, 30000);
    if (this.config.up) this.camera.up.copy(this.config.up);

    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    this.setActions(defaultActions);

    this.resize();

    this.initEvent();
  }

  initEvent() {
    this.pointCloud.addEventListener("select", (ev) => {
      const obj = ev.selection.findLast((o) => o instanceof Object3D);
      if (obj) {
        this.focalized(obj as Box3D);
      } else {
        this.activeBox = undefined;
      }
      this.render();
    });
  }

  resize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    super.resize();
  }

  focalized(activeBox?: Box3D) {
    if (activeBox) this.activeBox = activeBox;
    else if (this.activeBox) activeBox = this.activeBox;
    if (!activeBox) return;

    // TODO: 将相机移至激活对象中心
  }

  render() {
    this.pointCloud.points.material.activeMode = 0;
    this.pointCloud.points.material.cutPadding = 0;
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
