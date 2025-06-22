import { Box3, Camera, CameraHelper, Matrix4, OrthographicCamera, Quaternion, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import type ShareScene from "../common/ShareScene";
import Viewer from "./Viewer";

interface ViewerConfig {
  axis: Axis;
  name?: string;
}

const AXIS_UP_MAPPING: Record<Axis, Vector3> = {
  x: new Vector3(0, 0, 1),
  "-x": new Vector3(0, 0, 1),
  y: new Vector3(0, 0, 1),
  "-y": new Vector3(0, 0, 1),
  z: new Vector3(1, 0, 0),
  "-z": new Vector3(1, 0, 0),
};

export default class OrthographicViewer extends Viewer {
  axis: Axis;
  viewDirection: Vector3;
  camera: OrthographicCamera;
  cameraHelper: CameraHelper;
  controls: OrbitControls;

  constructor(container: HTMLElement, shareScene: ShareScene, config: ViewerConfig) {
    super(container, shareScene, config.name);

    this.camera = new OrthographicCamera();
    this.cameraHelper = new CameraHelper(this.camera);
    this.cameraHelper.visible = false;
    shareScene.scene.add(this.camera, this.cameraHelper);

    this.axis = config.axis;
    this.viewDirection = new Vector3();
    this.setAxis(this.axis);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.addEventListener("change", () => this.shareScene.render());
  }

  setAxis(axis: Axis) {
    this.axis = axis;

    this.camera.up.copy(AXIS_UP_MAPPING[axis]);

    // 使用正则解析方向轴名并设置 viewDirection
    const match = axis.match(/^(-?)([x-z])$/i);
    if (!match) throw new Error(`Invalid axis: ${axis}`);

    const [, sign, letter] = match;
    this.viewDirection.setScalar(0);
    this.viewDirection[letter as PositiveAxis<Axis>] = sign === "-" ? -1 : 1;

    if (this.focusObject) this.focus();
    else this.render();
  }

  focus(object = this.focusObject) {
    this.focusObject = object;
    if (!object) return;
    // 1. 获取包围盒中心和大小
    const box = new Box3().setFromObject(object);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    // 2. 将视角方向从局部转换为世界空间方向
    const worldDir = this.viewDirection
      .clone()
      .applyQuaternion(object.getWorldQuaternion(new Quaternion()))
      .normalize();

    // 3. 设置相机的位置 = 中心点沿观察方向推远
    const distance = size.length(); // 或者用 size.z * 1.5 保守距离
    const position = center.clone().addScaledVector(worldDir, distance);

    this.camera.position.copy(position);
    this.camera.lookAt(center);
    this.camera.updateMatrixWorld();
    this.controls.target.copy(center);

    const projectedSize = computeProjectedSize(this.camera, box);

    const aspect = this.width / this.height;
    const padding = 1.2;
    const halfW = (projectedSize.width * padding) / 2;
    const halfH = (projectedSize.height * padding) / 2;
    this.camera.left = -halfW * aspect;
    this.camera.right = halfW * aspect;
    this.camera.top = halfH * aspect;
    this.camera.bottom = -halfH * aspect;
    this.camera.near = 0;
    this.camera.far = distance * 2;
    this.camera.updateProjectionMatrix();

    this.render();
  }

  renderFrame(): void {
    this.cameraHelper.update();
    // TODO: 定制化渲染
    this.renderer.render(this.shareScene.scene, this.camera);
  }
}

function computeProjectedSize(camera: Camera, box: Box3): { width: number; height: number } {
  const points = [
    new Vector3(box.min.x, box.min.y, box.min.z),
    new Vector3(box.min.x, box.min.y, box.max.z),
    new Vector3(box.min.x, box.max.y, box.min.z),
    new Vector3(box.min.x, box.max.y, box.max.z),
    new Vector3(box.max.x, box.min.y, box.min.z),
    new Vector3(box.max.x, box.min.y, box.max.z),
    new Vector3(box.max.x, box.max.y, box.min.z),
    new Vector3(box.max.x, box.max.y, box.max.z),
  ];

  const inv = new Matrix4().copy(camera.matrixWorld).invert();

  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  for (const p of points) {
    const projected = p.clone().applyMatrix4(inv);
    minX = Math.min(minX, projected.x);
    maxX = Math.max(maxX, projected.x);
    minY = Math.min(minY, projected.y);
    maxY = Math.max(maxY, projected.y);
  }

  return { width: maxX - minX, height: maxY - minY };
}
