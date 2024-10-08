import {
  Box3,
  Box3Helper,
  Color,
  EventDispatcher,
  Scene,
  Vector3,
} from "three";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";

export default class PointCloud extends EventDispatcher {
  scene: Scene;
  trimBox: Box3Helper;
  constructor() {
    super();

    this.scene = new Scene();

    this.trimBox = new Box3Helper(
      new Box3(new Vector3(-5, -5, -5), new Vector3(5, 5, 5)),
      new Color(0xffff00),
    );
    this.scene.add(this.trimBox);
  }

  async load(url: string, onProgress?: (e: ProgressEvent) => void) {
    const pcdLoader = new PCDLoader();
    const points = await pcdLoader.loadAsync(url, onProgress);
    this.scene.add(points);
  }
}
