import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import type ShareScene from "../common/ShareScene";
import Viewer from "./Viewer";

interface ViewerConfig {
  name?: string;
}

export default class ImageViewer extends Viewer {
  camera: PerspectiveCamera;
  controls: OrbitControls;

  constructor(container: HTMLElement, shareScene: ShareScene, config: ViewerConfig = {}) {
    super(container, shareScene, config.name);

    this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 30000);
    shareScene.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.addEventListener("change", () => this.render());
  }
  resize(): void {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    super.resize();
  }
  renderFrame(): void {
    // TODO: 定制化渲染
    this.renderer.render(this.shareScene.scene, this.camera);
  }
}
