import {
  Box3,
  Color,
  LineSegments,
  Object3D,
  OrthographicCamera,
  Vector3,
} from "three";
import Viewer from "./Viewer";
import type PointCloud from "../PointCloud";
import { OrbitControls } from "three/examples/jsm/Addons.js";

enum AxisMapping {
  Front = "y",
  Back = "-y",
  Left = "-x",
  Right = "x",
  Top = "z",
  Bottom = "-z",
}

export const dirMapping = {
  [AxisMapping.Front]: new Vector3(0, 1, 0),
  [AxisMapping.Back]: new Vector3(0, -1, 0),
  [AxisMapping.Left]: new Vector3(-1, 0, 0),
  [AxisMapping.Right]: new Vector3(1, 0, 0),
  [AxisMapping.Top]: new Vector3(0, 0, 1),
  [AxisMapping.Bottom]: new Vector3(0, 0, -1),
};

export type axisType = `${AxisMapping}`;

interface SideViewerConfig {
  axis: axisType;
  paddingPercent: number;
}

const defaultConfig: SideViewerConfig = {
  axis: "z",
  paddingPercent: 1,
};

export default class SideViewer extends Viewer {
  config: SideViewerConfig;

  dir: "x" | "y" | "z" = "z";

  camera: OrthographicCamera;
  controller: OrbitControls;

  activeBox: Object3D | null = null;
  projectRect = new Box3();

  constructor(
    container: HTMLElement,
    pointCloud: PointCloud,
    config?: Partial<SideViewerConfig>,
  ) {
    super(container, pointCloud);

    this.camera = new OrthographicCamera(-2, 2, 2, -2, 0, 10);
    this.camera.up.copy(this.pointCloud.up);

    this.controller = new OrbitControls(this.camera, this.renderer.domElement);
    this.controller.enableRotate = false;
    this.controller.addEventListener("change", () => {
      this.render();
    });

    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.resize();

    this.setAxis(this.config.axis);

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
    this.camera.updateProjectionMatrix();
    super.resize();
  }

  setAxis(axis: axisType) {
    this.config.axis = axis;
    const isInverse = axis.length === 2;
    this.dir = (isInverse ? axis[1] : axis[0]) as "x" | "y" | "z";

    if (this.activeBox) this.focalized();

    this.render();
  }

  focalized(activeBox?: Object3D) {
    if (activeBox) this.activeBox = activeBox;
    else if (this.activeBox) activeBox = this.activeBox;
    if (!activeBox) return;

    const box = new Box3().setFromObject(activeBox);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    const position = new Vector3().copy(center);
    switch (this.dir) {
      case "x":
        position.multiply(new Vector3(0, size.y, 0));
        break;
      case "y":
        position.multiply(new Vector3(size.x, 0, 0));
        break;
      case "z":
        position.multiply(new Vector3(0, 0, size.z));
        break;
    }
    // 更新相机位置
    this.camera.position.copy(position);
    this.camera.lookAt(center); // 使相机朝向物体中心

    this.updateProjectRect();
    this.updateCameraProject();
  }

  updateProjectRect() {
    if (!this.activeBox) return;
    this.camera.updateMatrixWorld();
    this.activeBox.updateMatrixWorld();
    const bbox = new Box3().setFromObject(this.activeBox);
    const minProject = new Vector3().copy(bbox.min);
    const maxProject = new Vector3().copy(bbox.max);

    minProject
      .applyMatrix4(this.activeBox.matrixWorld)
      .applyMatrix4(this.camera.matrixWorldInverse);
    maxProject
      .applyMatrix4(this.activeBox.matrixWorld)
      .applyMatrix4(this.camera.matrixWorldInverse);

    const min = new Vector3();
    const max = new Vector3();

    const xMin = Math.min(minProject.x, maxProject.x);
    const xMax = Math.max(minProject.x, maxProject.x);
    const yMin = Math.min(minProject.y, maxProject.y);
    const yMax = Math.max(minProject.y, maxProject.y);
    const zMin = Math.min(minProject.z, maxProject.z);
    const zMax = Math.max(minProject.z, maxProject.z);

    min.set(xMin, yMin, zMin);
    max.set(xMax, yMax, zMax);

    this.projectRect.min.copy(min);
    this.projectRect.max.copy(max);
  }

  updateCameraProject() {
    const rectWidth = this.projectRect.max.x - this.projectRect.min.x;
    const rectHeight = this.projectRect.max.y - this.projectRect.min.y;
    const aspect = this.width / this.height;

    const padding =
      Math.min(rectWidth, rectHeight) * this.config.paddingPercent;
    const cameraW = Math.max(
      rectWidth + padding,
      (rectHeight + padding) * aspect,
    );
    const cameraH = Math.max(
      rectHeight + padding,
      (rectWidth + padding) * aspect,
    );

    this.camera.left = -cameraW / 2;
    this.camera.right = cameraW / 2;
    this.camera.top = cameraH / 2;
    this.camera.bottom = -cameraH / 2;
    this.camera.near = this.projectRect.min.z;
    this.camera.far = this.projectRect.max.z - this.projectRect.min.z;

    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (this.activeBox) {
      this.pointCloud.points.material.activeMode = "clip_out_highlight";
      const box = this.activeBox as LineSegments;
      if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();
      this.pointCloud.points.material.activeBoxes = [
        {
          bbox: box.geometry.boundingBox!,
          matrix: this.activeBox.matrixWorld.clone().invert(),
          color: new Color(0x00ff00),
          opacity: 1,
        },
      ];
    }

    super.render();
  }
}
