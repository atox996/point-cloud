import { Box3, Object3D, OrthographicCamera, Vector3 } from "three";
import Viewer from "./Viewer";
import type PointCloud from "../PointCloud";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export const axisUpInfo = {
  x: {
    yAxis: { axis: "z", dir: new Vector3(0, 0, 1) },
    xAxis: { axis: "y", dir: new Vector3(0, 1, 0) },
  },
  "-x": {
    yAxis: { axis: "z", dir: new Vector3(0, 0, 1) },
    xAxis: { axis: "y", dir: new Vector3(0, -1, 0) },
  },
  z: {
    yAxis: { axis: "x", dir: new Vector3(1, 0, 0) },
    xAxis: { axis: "y", dir: new Vector3(0, -1, 0) },
  },
  // '-z': {
  //     yAxis: { axis: 'y', dir: new Vector3(0, 1, 0) },
  //     xAxis: { axis: 'x', dir: new Vector3(-1, 0, 0) },
  // },
  y: {
    yAxis: { axis: "z", dir: new Vector3(0, 0, 1) },
    xAxis: { axis: "x", dir: new Vector3(-1, 0, 0) },
  },
  "-y": {
    yAxis: { axis: "z", dir: new Vector3(0, 0, 1) },
    xAxis: { axis: "x", dir: new Vector3(1, 0, 0) },
  },
};

export type axisType = keyof typeof axisUpInfo;

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

  camera: OrthographicCamera;
  controller: OrbitControls;
  projectRect: Box3;

  alignAxis: Vector3 = new Vector3();
  object: Object3D | null = null;

  constructor(
    container: HTMLElement,
    pointCloud: PointCloud,
    config?: Partial<SideViewerConfig>,
  ) {
    super(container, pointCloud);

    this.camera = new OrthographicCamera(-2, 2, 2, -2, 0, 10);

    this.controller = new OrbitControls(this.camera, this.renderer.domElement);
    this.controller.enableRotate = false;
    this.controller.addEventListener("change", () => {
      this.render();
    });

    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.projectRect = new Box3();

    this.resize();

    this.setAxis(this.config.axis);

    this.initEvent();
  }

  initEvent() {
    this.pointCloud.addEventListener("select", (ev) => {
      const obj = ev.selection.findLast((o) => o instanceof Object3D);
      if (obj) {
        this.fitObject(obj);
      } else {
        this.object = null;
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
    this.alignAxis.set(0, 0, 0);
    const isInverse = axis.length === 2;
    const axisValue = isInverse ? axis[1] : axis[0];
    this.alignAxis[axisValue as "x" | "y" | "z"] = isInverse ? -0.5 : 0.5;

    if (this.object) this.fitObject();

    this.render();
  }

  fitObject(object?: Object3D) {
    if (object) this.object = object;
    else if (this.object) object = this.object;
    if (!object) return;
    object.updateMatrixWorld();

    const temp = new Vector3();
    temp.copy(this.alignAxis);
    temp.applyMatrix4(object.matrixWorld);
    this.camera.position.copy(temp);

    temp
      .copy(axisUpInfo[this.config.axis].yAxis.dir)
      .applyMatrix4(object.matrixWorld)
      .sub(new Vector3().applyMatrix4(object.matrixWorld));

    this.camera.up.copy(temp);
    temp.set(0, 0, 0);
    temp.applyMatrix4(object.matrixWorld);
    this.camera.lookAt(temp);

    this.updateProjectRect();
    this.updateCameraProject();
  }

  updateProjectRect() {
    this.camera.updateMatrixWorld();
    const { trimBox } = this.pointCloud;
    trimBox.updateMatrixWorld();
    if (!trimBox.geometry.boundingBox) trimBox.geometry.computeBoundingBox();
    const bbox = trimBox.geometry.boundingBox!;
    const minProject = new Vector3().copy(bbox.min);
    const maxProject = new Vector3().copy(bbox.max);

    minProject
      .applyMatrix4(trimBox.matrixWorld)
      .applyMatrix4(this.camera.matrixWorldInverse);
    maxProject
      .applyMatrix4(trimBox.matrixWorld)
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
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  }
}
