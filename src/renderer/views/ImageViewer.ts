import { ArrowHelper, CameraHelper, Mesh, MeshBasicMaterial, OrthographicCamera, SphereGeometry } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import type ShareScene from "../common/ShareScene";
import { extractCameraPositionAndDirection } from "../utils";
import Viewer from "./Viewer";

interface ViewerConfig {
  img: string;
  extrinsics: number[]; // 4x4 列主序矩阵
  intrinsics: { fx: number; fy: number; cx: number; cy: number };
  name?: string;
}

export default class ImageViewer extends Viewer {
  camera: OrthographicCamera;
  controls: OrbitControls;
  imageMesh?: Mesh;
  constructor(container: HTMLElement, shareScene: ShareScene, config: ViewerConfig) {
    super(container, shareScene, config.name);

    this.camera = new OrthographicCamera();
    // this.camera.layers.set(1);
    this.camera.layers.enable(1);
    this.cameraHelper = new CameraHelper(this.camera);
    // this.cameraHelper.visible = false;
    shareScene.scene.add(this.camera, this.cameraHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.addEventListener("change", () => this.shareScene.render());

    // this.loadImage(config);

    const { position, direction } = extractCameraPositionAndDirection(config.extrinsics);

    const sphere = new Mesh(new SphereGeometry(1, 16, 16), new MeshBasicMaterial({ color: 0xff0000 }));
    sphere.position.copy(position);

    const arrow = new ArrowHelper(
      direction.negate(), // 朝向
      position, // 起点
      50,
      0x00ff00,
    );

    this.shareScene.scene.add(sphere, arrow);
  }
  // private loadImage(config: ViewerConfig) {
  //   const loader = new TextureLoader();
  //   loader.load(config.img, (texture) => {
  //     const { width, height } = texture.image;
  //     const geometry = new PlaneGeometry(width, height);
  //     const material = new MeshBasicMaterial({ map: texture, side: 2 });
  //     this.imageMesh = new Mesh(geometry, material);
  //     this.imageMesh.layers.set(1);
  //     this.shareScene.scene.add(this.imageMesh);

  //     const { fx, fy, cx, cy } = config.intrinsics;
  //     const { extrinsics } = config;

  //     // 设定正交相机视锥边界
  //     const nearPlaneDistance = 1;

  //     const left = (-cx / fx) * nearPlaneDistance;
  //     const right = ((width - cx) / fx) * nearPlaneDistance;
  //     const top = (cy / fy) * nearPlaneDistance;
  //     const bottom = (-(height - cy) / fy) * nearPlaneDistance;

  //     this.camera.left = left;
  //     this.camera.right = right;
  //     this.camera.top = top;
  //     this.camera.bottom = bottom;
  //     this.camera.near = 0.1;
  //     this.camera.far = 1000;
  //     this.camera.updateProjectionMatrix();

  //     // 设置相机世界变换矩阵，禁用自动更新
  //     const matrix = new Matrix4().fromArray(extrinsics);
  //     this.camera.matrix.copy(matrix);
  //     this.camera.matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);

  //     // 将图片平面放置于相机前方 nearPlaneDistance 处，保持与相机旋转一致
  //     const forward = new Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
  //     const planePos = this.camera.position.clone().add(forward.multiplyScalar(nearPlaneDistance));

  //     this.imageMesh.position.copy(planePos);
  //     this.imageMesh.quaternion.copy(this.camera.quaternion);
  //     this.imageMesh.scale.set(1, 1, 1);
  //     this.render();
  //   });
  // }

  resize(): void {
    super.resize();
  }
  focus(object = this.focusObject): void {
    this.focusObject = object;
    if (!object) return;
    // TODO: 聚焦相机到元素
  }
  renderFrame(): void {
    this.cameraHelper?.update();
    // TODO: 定制化渲染
    this.renderer.render(this.shareScene.scene, this.camera);
  }
}
