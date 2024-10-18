import {
  AxesHelper,
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
  scene: Scene;
  points: Points<BufferGeometry, PointsMaterial>;
  trimBox: LineSegments<EdgesGeometry, LineBasicMaterial>;
  selection: Object3D[] = [];

  constructor() {
    super();

    this.scene = new Scene();

    this.points = new Points(createGeometry(), new PointsMaterial());

    const geometry = new BoxGeometry(4.68, 2.03, 1.55);
    const edges = new EdgesGeometry(geometry);
    this.trimBox = new LineSegments(
      edges,
      new LineBasicMaterial({ color: 0x00ff00 }),
    );
    this.trimBox.position.set(9.02, 14.08, 0.65);
    this.trimBox.rotation.set(0, 0, 44.75 * (Math.PI / 180));

    const axesHelper = new AxesHelper(5);

    this.scene.add(this.points, this.trimBox, axesHelper);
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
