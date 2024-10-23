import Viewer from "./Viewer";
import type ShareScene from "../ShareScene";
import type { ActionName } from "../actions";
import { Box3D } from "../objects";
import { FreeCamera } from "../cameras";
import { AxesHelper, type Vector3 } from "three";

interface ViewerConfig {
  up?: Vector3;
}

const defaultActions: ActionName[] = ["Create", "OrbitControls"];

export default class MainViewer extends Viewer {
  config: ViewerConfig;

  camera: FreeCamera;

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

    this.camera = new FreeCamera(35, this.width / this.height, 1, 30000);
    if (this.config.up) this.camera.up.copy(this.config.up);

    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    const axisHelper = new AxesHelper(10);
    shareScene.scene.add(axisHelper);

    this.resize();

    this.setActions(defaultActions);

    this.initEvent();
  }

  initEvent() {
    this.shareScene.addEventListener("select", (ev) => {
      const obj = ev.selection.findLast((o) => o instanceof Box3D);
      if (obj) {
        this.focusTarget(obj);
      } else {
        this.activeBox = undefined;
      }
      this.render();
    });
  }

  focusTarget(activeBox?: Box3D) {
    if (activeBox) this.activeBox = activeBox;
    else if (this.activeBox) activeBox = this.activeBox;
    if (!activeBox) return;
    this.camera.focusTarget(activeBox);
    const controllerAction = this.getAction("OrbitControls");
    if (controllerAction) {
      controllerAction.controller.target.copy(this.camera.lookTarget);
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
