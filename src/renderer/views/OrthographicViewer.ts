import { OrthographicCamera } from "three";

import type ShareScene from "../common/ShareScene";
import Viewer from "./Viewer";

interface ViewerConfig {
  name?: string;
}

export default class OrthographicViewer extends Viewer {
  camera: OrthographicCamera;
  constructor(container: HTMLElement, shareScene: ShareScene, config: ViewerConfig = {}) {
    super(container, shareScene, config.name);

    this.camera = new OrthographicCamera();
    shareScene.scene.add(this.camera);
  }

  renderFrame(): void {
    // TODO: 定制化渲染
    this.renderer.render(this.shareScene.scene, this.camera);
  }
}
