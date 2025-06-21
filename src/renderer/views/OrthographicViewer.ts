import { OrthographicCamera } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import type ShareScene from "../common/ShareScene";
import Viewer from "./Viewer";

interface ViewerConfig {
  name?: string;
}

export default class OrthographicViewer extends Viewer {
  camera: OrthographicCamera;
  controls: OrbitControls;

  constructor(container: HTMLElement, shareScene: ShareScene, config: ViewerConfig = {}) {
    super(container, shareScene, config.name);

    this.camera = new OrthographicCamera();
    shareScene.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.addEventListener("change", () => this.render());
  }

  renderFrame(): void {
    // TODO: 定制化渲染
    this.renderer.render(this.shareScene.scene, this.camera);
  }
}
