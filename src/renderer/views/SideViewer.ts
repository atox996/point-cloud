import {
  BufferGeometry,
  CameraHelper,
  Color,
  LineSegments,
  Object3D,
  OrthographicCamera,
  Vector3,
  type Vector3Like,
} from "three";
import Viewer from "./Viewer";
import type PointCloud from "../PointCloud";
import { ActionName } from "../actions";
import { getBoundingBoxInCameraView } from "../utils";
import type { PositiveAxis } from "../typings";

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

export type AxisType = keyof typeof axisUpInfo;

interface ViewerConfig {
  up?: Vector3Like;
  axis: AxisType;
  // 聚焦时窗口边缘留出一定的空间
  paddingPercent: number;
}

const defaultConfig: ViewerConfig = {
  axis: "y",
  paddingPercent: 1,
};

const defaultActions = [ActionName.OrbitControls];

interface Box3D extends Object3D {
  geometry: BufferGeometry;
}

export default class SideViewer extends Viewer {
  config: ViewerConfig;

  camera: OrthographicCamera;
  cameraHelper: CameraHelper;

  activeBox?: Box3D;

  constructor(
    container: HTMLElement,
    pointCloud: PointCloud,
    config?: Partial<ViewerConfig>,
  ) {
    super(container, pointCloud);

    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.camera = new OrthographicCamera(-2, 2, 2, -2, 0, 10);
    if (this.config.up) this.camera.up.copy(this.config.up);

    // DEBUG
    this.cameraHelper = new CameraHelper(this.camera);
    pointCloud.scene.add(this.cameraHelper);

    this.setActions(defaultActions);

    const controllerAction = this.getAction(ActionName.OrbitControls);
    if (controllerAction) controllerAction.controller.enableRotate = false;

    this.resize();

    this.initEvent();

    this.setAxis(this.config.axis);
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
    // TODO: 更新相机参数
    // this.camera.updateProjectionMatrix();

    super.resize();
  }

  setAxis(axis: AxisType) {
    this.config.axis = axis;
    this.focalized(this.activeBox);
    this.render();
  }

  focalized(activeBox?: Box3D) {
    if (activeBox) this.activeBox = activeBox;
    else if (this.activeBox) activeBox = this.activeBox;
    if (!activeBox) return;

    activeBox.updateMatrixWorld();

    const alignAxis = new Vector3();
    const isInverse = this.config.axis.startsWith("-");
    const axisValue = this.config.axis.slice(
      isInverse ? 1 : 0,
    ) as PositiveAxis<AxisType>;

    alignAxis[axisValue] = isInverse ? -0.5 : 0.5;

    const temp = new Vector3();
    temp.copy(alignAxis);
    temp.applyMatrix4(activeBox.matrixWorld);
    this.camera.position.copy(temp);

    temp
      .copy(axisUpInfo[this.config.axis].yAxis.dir)
      .applyMatrix4(activeBox.matrixWorld)
      .sub(new Vector3().applyMatrix4(activeBox.matrixWorld));
    this.camera.up.copy(temp);

    temp.set(0, 0, 0);
    temp.applyMatrix4(activeBox.matrixWorld);
    this.camera.lookAt(temp);
    const controllerAction = this.getAction(ActionName.OrbitControls);
    if (controllerAction) {
      controllerAction.controller.target.copy(temp);
      controllerAction.controller.update();
    }

    this.updateCameraProject();
  }

  updateCameraProject() {
    if (!this.activeBox) return;
    const bbox = getBoundingBoxInCameraView(this.activeBox, this.camera);
    const rectWidth = bbox.max.x - bbox.min.x;
    const rectHeight = bbox.max.y - bbox.min.y;
    const aspect = this.width / this.height;

    const padding =
      Math.min(rectWidth, rectHeight) * this.config.paddingPercent;
    // let padding = (200 * rectWidth) / this.width;
    const cameraW = Math.max(
      rectWidth + padding,
      (rectHeight + padding) * aspect,
    );
    const cameraH = Math.max(
      rectHeight + padding,
      (rectWidth + padding) / aspect,
    );

    this.camera.left = -cameraW / 2;
    this.camera.right = cameraW / 2;
    this.camera.top = cameraH / 2;
    this.camera.bottom = -cameraH / 2;
    // debugger
    this.camera.far = bbox.max.z - bbox.min.z;
    this.camera.updateProjectionMatrix();

    // this.camera.position.add(this.cameraOffset);
    // this.camera.updateMatrixWorld();
    // this.camera.far = 0;
    this.cameraHelper?.update();
  }

  render() {
    this.pointCloud.points.material.activeMode = 2;
    this.pointCloud.points.material.cutPadding = 5;

    if (this.activeBox) {
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
