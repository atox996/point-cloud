import { Camera, EventDispatcher, WebGLRenderer } from "three";
import type PointCloud from "../PointCloud";

export default abstract class Viewer extends EventDispatcher {
  container: HTMLElement;
  renderer: WebGLRenderer;
  pointCloud: PointCloud;

  get width() {
    return this.container.clientWidth;
  }
  get height() {
    return this.container.clientHeight;
  }

  abstract camera: Camera;

  _listeners?: Record<string, Array<(e: Event) => void>>;
  resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, pointCloud: PointCloud) {
    super();

    this.container = container;
    this.renderer = new WebGLRenderer({ antialias: true });
    this.container.appendChild(this.renderer.domElement);

    this.pointCloud = pointCloud;

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  resize() {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  render() {
    this.renderer.render(this.pointCloud.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.resizeObserver.disconnect();
    this._listeners = {};
  }
}
