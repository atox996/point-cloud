import {
  BufferGeometry,
  EventDispatcher,
  Float32BufferAttribute,
  Points,
  Scene,
} from "three";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import PointsMaterial from "./material/PointsMaterial";
import type { Box3D } from "./objects";

interface TEventMap {
  select: { selection: Box3D[] };
}

interface PointGeometryData {
  position?: number[];
  color?: number[];
  intensity?: number[];
}

function createGeometry(data: PointGeometryData = {}) {
  const geometry = new BufferGeometry();

  const positionAttr = new Float32BufferAttribute(data.position || [], 3);

  const intensityAttr = new Float32BufferAttribute(data.intensity || [], 1);

  const colorAttr = new Float32BufferAttribute(data.color || [], 3);

  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("intensity", intensityAttr);
  geometry.setAttribute("color", colorAttr);
  return geometry;
}

export default class ShareScene extends EventDispatcher<TEventMap> {
  scene: Scene;

  points: Points<BufferGeometry, PointsMaterial>;

  selection: Box3D[] = [];

  constructor() {
    super();

    this.scene = new Scene();

    this.points = new Points(createGeometry(), new PointsMaterial());

    this.scene.add(this.points);
  }

  select(...boxes: Box3D[]) {
    this.selection = boxes;
    this.dispatchEvent({
      type: "select",
      selection: boxes,
    });
  }

  async loadPointCloud(url: string, onProgress?: (e: ProgressEvent) => void) {
    const pcdLoader = new PCDLoader();
    const { geometry } = await pcdLoader.loadAsync(url, onProgress);
    this.points.geometry.dispose();
    this.points.geometry = geometry;
    return this.points;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();

    this.scene.clear();
  }
}
