import { Box3, OrthographicCamera, Vector3 } from "three";
import type { CameraImplements } from "./type";
import type { Box3D } from "../objects";

export default class AxisCamera
  extends OrthographicCamera
  implements CameraImplements
{
  axis: "x" | "y" | "z" | "-x" | "-y" | "-z" = "z";

  readonly lookTarget = new Vector3();
  /**
   * Rotates the object to face a point in world space.
   * @remarks This method does not support objects having non-uniformly-scaled parent(s).
   * @param vector A vector representing a position in world space to look at.
   */
  lookAt(vector: Vector3): void;
  /**
   * Rotates the object to face a point in world space.
   * @remarks This method does not support objects having non-uniformly-scaled parent(s).
   * @param x Expects a `Float`
   * @param y Expects a `Float`
   * @param z Expects a `Float`
   */
  lookAt(x: number, y: number, z: number): void;
  lookAt(x: number | Vector3 = 0, y = 0, z = 0): void {
    if (x instanceof Vector3) {
      this.lookTarget.copy(x);
      super.lookAt(x);
    } else {
      this.lookTarget.set(x, y, z);
      super.lookAt(x, y, z);
    }
  }

  resize(width: number, height: number): void {
    // throw new Error("Method not implemented.");
    console.log("resize", width, height);
  }

  focusTarget<T extends Box3D>(target: T): void {
    const bbox = this.getBoundingBox(target);
    const center = bbox.getCenter(new Vector3());
    this.position.set(0, 0, 5).add(center);
    this.lookAt(center);
  }

  getBoundingBox<T extends Box3D>(box: T) {
    if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();
    const bbox = box.geometry.boundingBox!;
    const minProject = bbox.min.clone();
    const maxProject = bbox.max.clone();

    box.updateMatrixWorld();
    this.updateMatrixWorld();
    // 本地空间 ---> 世界空间 ---> 相机视图空间
    minProject
      .applyMatrix4(box.matrixWorld)
      .applyMatrix4(this.matrixWorldInverse);
    maxProject
      .applyMatrix4(box.matrixWorld)
      .applyMatrix4(this.matrixWorldInverse);

    const xMin = Math.min(minProject.x, maxProject.x);
    const xMax = Math.max(minProject.x, maxProject.x);
    const yMin = Math.min(minProject.y, maxProject.y);
    const yMax = Math.max(minProject.y, maxProject.y);
    const zMin = Math.min(minProject.z, maxProject.z);
    const zMax = Math.max(minProject.z, maxProject.z);

    const min = new Vector3(xMin, yMin, zMin);
    const max = new Vector3(xMax, yMax, zMax);
    return new Box3(min, max);
  }
}
