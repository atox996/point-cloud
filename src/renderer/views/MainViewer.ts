import { PerspectiveCamera } from "three";
import type PointCloud from "../PointCloud";
import Viewer from "./Viewer";
import { ActionName } from "../actions";

const defaultActions = [ActionName.Create, ActionName.OrbitControls];

export default class MainViewer extends Viewer {
  camera: PerspectiveCamera;

  constructor(container: HTMLElement, pointCloud: PointCloud) {
    super(container, pointCloud);

    this.camera = new PerspectiveCamera(35, this.width / this.height, 1, 30000);

    this.camera.position.set(0, 0, 100);
    this.camera.up.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);

    this.setActions(defaultActions);

    this.resize();
  }

  resize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    super.resize();
  }
}
