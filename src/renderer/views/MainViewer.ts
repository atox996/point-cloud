import { PerspectiveCamera, Vector3, type Vector3Like } from "three";
import Viewer from "./Viewer";
import type ShareScene from "../ShareScene";
import { getBoundingBoxInWorldSpace } from "../utils";
import type { ActionName } from "../actions";
import { Box3D } from "../objects";

interface ViewerConfig {
  up?: Vector3Like;
}

const defaultActions: ActionName[] = ["Create", "OrbitControls"];

export default class MainViewer extends Viewer {
  config: ViewerConfig;

  camera: PerspectiveCamera;

  activeBox?: Box3D;

  constructor(
    container: HTMLElement,
    shareScene: ShareScene,
    config?: Partial<ViewerConfig>,
  ) {
    super(container, shareScene);

    this.config = {
      ...config,
    };

    this.camera = new PerspectiveCamera(35, this.width / this.height, 1, 30000);
    if (this.config.up) this.camera.up.copy(this.config.up);

    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    this.setActions(defaultActions);

    this.resize();

    this.initEvent();
  }

  initEvent() {
    this.shareScene.addEventListener("select", (ev) => {
      const obj = ev.selection.findLast((o) => o instanceof Box3D);
      if (obj) {
        this.focalized(obj);
      } else {
        this.activeBox = undefined;
      }
      this.render();
    });
  }

  resize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    super.resize();
  }

  focalized(activeBox?: Box3D) {
    if (activeBox) this.activeBox = activeBox;
    else if (this.activeBox) activeBox = this.activeBox;
    if (!activeBox) return;

    const bbox = getBoundingBoxInWorldSpace(activeBox);
    const center = bbox.getCenter(new Vector3());
    this.camera.position.set(0, 0, 100).add(center);
    this.camera.lookAt(center);
    const controllerAction = this.getAction("OrbitControls");
    if (controllerAction) {
      controllerAction.controller.target.copy(center);
      controllerAction.controller.update();
    }
  }

  render() {
    this.shareScene.points.material.activeMode = 0;
    this.shareScene.points.material.cutPadding = 0;
    this.shareScene.points.material.activeBoxes = this.shareScene.selection.map(
      (box) => {
        if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();
        return {
          bbox: box.geometry.boundingBox!,
          matrix: box.matrixWorld.clone().invert(),
          color: box.material.color,
          opacity: 1,
        };
      },
    );

    super.render();
  }
}
