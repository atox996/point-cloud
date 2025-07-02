import { AxesHelper, Box3, Box3Helper, EventDispatcher, Group, Mesh, Plane, PlaneHelper, Scene, Vector3 } from "three";

import type { InstanceAttributes } from "../utils/InstancedMeshManagger";
import type Viewer from "../views/Viewer";
import Boxes from "./objects/Boxes";
import Points, { type PointsData } from "./Points";
import PointsMaterial from "./PointsMaterial";

interface TEventMap {
  addObject: { ids: string[] };
  removeObject: { ids: string[] };
  select: { ids: string[] };
  clearData: EmptyObject;
  pointsChange: EmptyObject;
  renderBefore: EmptyObject;
  renderAfter: EmptyObject;
}

export default class ShareScene extends EventDispatcher<TEventMap> {
  scene: Scene;

  pointsGroup: Group;

  boxes: Boxes;

  ground: PlaneHelper;

  selectionMap = new Map<string, Mesh>();

  views: Viewer[] = [];

  material = new PointsMaterial();

  private originHelper: Box3Helper;

  private _renderTimer = 0;

  constructor() {
    super();
    this.scene = new Scene();
    this.pointsGroup = new Group();
    this.pointsGroup.name = "pointsGroup";
    this.boxes = new Boxes();

    this.ground = new PlaneHelper(new Plane(new Vector3(0, 0, -1), 0), 100, 0xeeeeee);
    this.ground.visible = false;

    this.originHelper = new Box3Helper(new Box3(new Vector3(-20, -20, -20), new Vector3(20, 20, 20)), 0xffff00);
    this.originHelper.visible = false;

    const axesHelper = new AxesHelper(100);
    axesHelper.visible = false;

    this.scene.add(this.pointsGroup, this.boxes.mesh, this.ground, this.originHelper, axesHelper);
  }

  addObject(...objects: InstanceAttributes[]) {
    this.boxes.upsert(objects);
    this.dispatchEvent({ type: "addObject", ids: objects.map((item) => item.id) });
    this.render();
  }

  removeObject(...ids: string[]) {
    let selectFlag = false;
    ids.forEach((id) => {
      this.boxes.remove([id]);
      if (this.selectionMap.has(id)) {
        selectFlag = true;
        this.selectionMap.delete(id);
      }
    });
    this.dispatchEvent({ type: "removeObject", ids });
    if (selectFlag) {
      this.selectObject(...this.selectionMap.values());
    }
    this.render();
  }

  selectObject(...objects: Mesh[]) {
    this.selectionMap.clear();
    objects.forEach((obj) => {
      this.selectionMap.set(obj.uuid, obj);
    });
    this.dispatchEvent({ type: "select", ids: objects.map((item) => item.uuid) });
  }

  selectObjectById(...ids: string[]) {
    const selection = ids.map((id) => this.boxes.getVirtualMesh(id));
    this.selectObject(...selection);
  }

  clearData() {
    this.selectObject();
    this.boxes.clear();
    this.dispatchEvent({ type: "clearData" });
    this.render();
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

  dispose() {
    this.boxes.dispose();
    this.selectionMap.clear();
    this.views.forEach((view) => {
      view.dispose();
    });
    this.views.length = 0;
    this.material.dispose();
  }
}
