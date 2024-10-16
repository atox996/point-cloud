import {
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  EventDispatcher,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  Points,
  Scene,
  Vector3,
  type BaseEvent,
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
  up = new Vector3(0, 0, 1);
  scene: Scene;
  points: Points<BufferGeometry, PointsMaterial>;
  trimBox: LineSegments<EdgesGeometry, LineBasicMaterial>;
  selection: Object3D[] = [];

  constructor() {
    super();

    this.scene = new Scene();
    this.scene.up.copy(this.up);

    this.points = new Points(createGeometry(), new PointsMaterial());

    const geometry = new BoxGeometry(11, 3, 3);
    const edges = new EdgesGeometry(geometry);
    this.trimBox = new LineSegments(
      edges,
      new LineBasicMaterial({ color: 0xffffff }),
    );
    this.trimBox.position.set(0, 0, geometry.parameters.depth / 2);
    // this.trimBox.rotation.set(0, 0, Math.PI / 4);
    this.scene.add(this.points, this.trimBox);
  }

  async load(url: string, onProgress?: (e: ProgressEvent) => void) {
    const pcdLoader = new PCDLoader();
    const { geometry } = await pcdLoader.loadAsync(url, onProgress);
    this.points.geometry.dispose();
    this.points.geometry = geometry;
    return this.points;
  }

  dispatchEvent<T extends Extract<keyof TEventMap, string>>(
    event: BaseEvent<T> & TEventMap[T],
  ) {
    if (event.type === "select") {
      this.selection = event.selection;
    }
    super.dispatchEvent(event);
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();

    this.trimBox.geometry.dispose();
    this.trimBox.material.dispose();

    this.scene.clear();
  }
}
