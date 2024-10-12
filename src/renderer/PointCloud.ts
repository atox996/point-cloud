import {
  Box3,
  Box3Helper,
  BufferGeometry,
  Color,
  EventDispatcher,
  Float32BufferAttribute,
  Object3D,
  Points,
  Scene,
  Vector3,
} from "three";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import PointsMaterial from "./material/PointsMaterial";

interface TEventMap {
  select: { selection: Object3D[] };
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

export default class PointCloud extends EventDispatcher<TEventMap> {
  scene: Scene;
  points: Points<BufferGeometry, PointsMaterial>;
  trimBox: Box3Helper;
  constructor() {
    super();

    this.scene = new Scene();

    this.points = new Points(createGeometry(), new PointsMaterial());

    this.trimBox = new Box3Helper(
      new Box3(new Vector3(-2, -2, -2), new Vector3(2, 2, 2)),
      new Color(0xffff00),
    );
    this.scene.add(this.points, this.trimBox);
  }

  async load(url: string, onProgress?: (e: ProgressEvent) => void) {
    const pcdLoader = new PCDLoader();
    const { geometry } = await pcdLoader.loadAsync(url, onProgress);
    this.points.geometry.dispose();
    this.points.geometry = geometry;
    return this.points;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();

    this.trimBox.dispose();

    this.scene.clear();
  }
}
