import {
  Box3,
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
import OrbitControlsAction from "../actions/OrbitControlsAction";

export type axisType = "x" | "-x" | "y" | "-y" | "z" | "-z";

interface ViewerConfig {
  up?: Vector3Like;
  axis: axisType;
  // 聚焦时窗口边缘留出一定的空间
  paddingPercent: number;
}

const defaultConfig: ViewerConfig = {
  axis: "y",
  paddingPercent: 1,
};

const defaultActions = [ActionName.OrbitControls];

export default class SideViewer extends Viewer {
  config: ViewerConfig;

  camera: OrthographicCamera;
  cameraHelper: CameraHelper;

  activeBox: Object3D | null = null;

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
    if (controllerAction instanceof OrbitControlsAction) {
      controllerAction.controller.enableRotate = false;
    }

    this.resize();

    this.initEvent();

    this.setAxis(this.config.axis);
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
    // TODO: 更新相机参数
    // this.camera.updateProjectionMatrix();

    super.resize();
  }

  setAxis(axis: axisType) {
    this.config.axis = axis;

    if (this.activeBox) {
      this.focalized();
      this.render();
    }
  }

  focalized(activeBox?: Object3D) {
    if (activeBox) this.activeBox = activeBox;
    else if (this.activeBox) activeBox = this.activeBox;
    if (!activeBox) return;

    console.log(activeBox);
    // this.updateCamera();
    this.cameraHelper.update();
  }

  computedProjectRect() {
    const { activeBox, camera } = this;
    if (!activeBox) return;
    camera.updateMatrixWorld();
    activeBox.updateMatrixWorld();
    const box = activeBox as LineSegments;
    if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();
    const boundingBox = box.geometry.boundingBox!;
    const minProject = boundingBox.min.clone();
    const maxProject = boundingBox.max.clone();
    minProject
      .applyMatrix4(box.matrixWorld)
      .applyMatrix4(this.camera.matrixWorldInverse);
    maxProject
      .applyMatrix4(box.matrixWorld)
      .applyMatrix4(this.camera.matrixWorldInverse);

    const xMin = Math.min(minProject.x, maxProject.x);
    const xMax = Math.max(minProject.x, maxProject.x);
    const yMin = Math.min(minProject.y, maxProject.y);
    const yMax = Math.max(minProject.y, maxProject.y);
    const zMin = Math.min(minProject.z, maxProject.z);
    const zMax = Math.max(minProject.z, maxProject.z);

    const min = new Vector3(xMin, yMin, zMin);
    const max = new Vector3(xMax, yMax, zMax);
    return new Box3(min, max);
  }

  updateCamera() {
    const projectRect = this.computedProjectRect()!;
    const center = projectRect.getCenter(new Vector3());
    this.camera.position.copy(center);
    this.camera.lookAt(center);
    this.updateCameraProject();
  }

  updateCameraProject() {
    const { min, max } = this.computedProjectRect()!;

    const rectWidth = max.x - min.x;
    const rectHeight = max.y - min.y;
    const aspect = this.width / this.height;
    const padding =
      Math.min(rectWidth, rectHeight) * this.config.paddingPercent;
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
    this.camera.near = min.z - max.z;
    this.camera.far = max.z - min.z;

    // 更新投影矩阵
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.pointCloud.points.material.activeMode = "clip_out_highlight";

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
