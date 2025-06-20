import { AxesHelper, EventDispatcher, Group, Scene } from "three";

import type Viewer from "../views/Viewer";
import PointsMaterial from "./material/PointsMaterial";
import Points, { type PointsData } from "./Points";

interface TEventMap {
  pointsChange: EmptyObject;
  renderBefore: EmptyObject;
  renderAfter: EmptyObject;
}

export default class ShareScene extends EventDispatcher<TEventMap> {
  scene: Scene;
  pointsGroup: Group;

  views: Viewer[] = [];
  material = new PointsMaterial();

  private _renderTimer = 0;
  constructor() {
    super();
    this.scene = new Scene();
    this.pointsGroup = new Group();

    this.scene.add(this.pointsGroup);

    // debug
    const axesHelper = new AxesHelper(100);
    axesHelper.visible = false;
    this.scene.add(axesHelper);
  }

  addView(viewer: Viewer) {
    if (this.views.includes(viewer)) return;
    this.views.push(viewer);
  }

  removeView(viewer: Viewer) {
    const index = this.views.indexOf(viewer);
    if (index === -1) return;
    this.views.splice(index, 1);
  }

  setPointCloud(data: PointsData) {
    let points: Points;
    if (this.pointsGroup.children.length > 0) {
      points = this.pointsGroup.children[0] as Points;
    } else {
      points = new Points(this.material);
      this.pointsGroup.add(points);
    }
    points.updateData(data);
    this.render();
  }

  loadPointCloud(url: string, onProgress?: (e: ProgressEvent) => void) {
    let points: Points;
    if (this.pointsGroup.children.length > 0) {
      points = this.pointsGroup.children[0] as Points;
    } else {
      points = new Points(this.material);
      points.addEventListener("pointsChange", () => {
        this.dispatchEvent({ type: "pointsChange" });
        this.render();
      });
      this.pointsGroup.add(points);
    }
    return points?.load(url, onProgress);
  }

  render() {
    if (this._renderTimer) return;
    this._renderTimer = requestAnimationFrame(() => {
      this.dispatchEvent({ type: "renderBefore" });
      this.views.forEach((view) => {
        view.render();
      });
      this.dispatchEvent({ type: "renderAfter" });
      this._renderTimer = 0;
    });
  }
}
