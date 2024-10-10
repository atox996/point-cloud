import {
  Box3,
  Box3Helper,
  Color,
  EventDispatcher,
  Object3D,
  Points,
  Scene,
  Vector3,
} from "three";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import PointMaterial from "./material/PointsMaterial";

interface TEventMap {
  select: { selection: Object3D[] };
}

export default class PointCloud extends EventDispatcher<TEventMap> {
  scene: Scene;
  trimBox: Box3Helper;
  constructor() {
    super();

    this.scene = new Scene();

    this.trimBox = new Box3Helper(
      new Box3(new Vector3(-2, -2, -2), new Vector3(2, 2, 2)),
      new Color(0xffff00),
    );
    this.scene.add(this.trimBox);
  }

  async load(url: string, onProgress?: (e: ProgressEvent) => void) {
    const pcdLoader = new PCDLoader();
    const { geometry } = await pcdLoader.loadAsync(url, onProgress);
    const points = new Points(geometry, new PointMaterial());
    this.scene.add(points);
  }
}
