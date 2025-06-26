import { Box3, MathUtils, PerspectiveCamera, Vector3 } from "three";

import type { ActionName } from "../actions";
import Box3D from "../common/objects/Box3D";
import type ShareScene from "../common/ShareScene";
import Viewer from "./Viewer";

interface ViewerConfig {
  name?: string;
  actions?: ActionName[];
}

const DEFAULT_ACTIONS: ActionName[] = ["Select", "OrbitControls"];

export default class PerspectiveViewer extends Viewer {
  readonly isPerspectiveViewer = true;

  camera: PerspectiveCamera;

  constructor(container: HTMLElement, shareScene: ShareScene, config: ViewerConfig = {}) {
    super(container, shareScene, config.name);

    this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 30000);
    this.camera.position.set(-0.01, 0, 100);

    this.setActions(...(config.actions || DEFAULT_ACTIONS));
  }

  initEvent(): void {
    this.shareScene.addEventListener("select", ({ selection }) => {
      const object = selection.find((o) => o instanceof Box3D);

      if (object) {
        if (this.autoFocus) this.focus(object);
      } else {
        this.focusObject = undefined;
      }
      this.render();
    });
  }

  resize(): void {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    super.resize();
  }

  focus(object = this.focusObject): void {
    this.focusObject = object;
    if (!object) return;
    const box = new Box3().setFromObject(object);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const radius = size.length() * 0.5;
    const fov = MathUtils.degToRad(this.camera.fov);
    const distance = radius / Math.sin(fov / 2);
    // 设置相机位置（从当前方向退远到 distance）
    const direction = new Vector3().copy(this.camera.position).normalize();
    const newPosition = center.clone().addScaledVector(direction, distance);
    this.camera.position.copy(newPosition);
    this.camera.updateProjectionMatrix();
  }

  renderFrame(): void {
    // TODO: 定制化渲染
    const { scene } = this.shareScene;
    this.renderer.render(scene, this.camera);
  }
}
