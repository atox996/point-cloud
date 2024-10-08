import { PerspectiveCamera, Raycaster } from "three";
import type PointCloud from "../PointCloud";
import Viewer from "./Viewer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class MainViewer extends Viewer {
  camera: PerspectiveCamera;
  raycaster: Raycaster;
  controller: OrbitControls;

  constructor(container: HTMLElement, pointCloud: PointCloud) {
    super(container, pointCloud);

    this.camera = new PerspectiveCamera(35, this.width / this.height, 1, 30000);

    this.camera.position.set(0, 0, 100);
    this.camera.up.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);

    this.controller = new OrbitControls(this.camera, this.renderer.domElement);
    this.controller.addEventListener("change", () => {
      this.render();
    });
    this.raycaster = new Raycaster();

    this.resize();
  }

  resize() {
    super.resize();

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    super.dispose();
    this.controller.dispose();
  }
}
