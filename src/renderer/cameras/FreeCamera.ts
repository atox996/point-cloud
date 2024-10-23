import { Box3, PerspectiveCamera, Vector3 } from "three";
import type { Box3D } from "../objects";
import type { CameraImplements } from "./type";

export default class FreeCamera
  extends PerspectiveCamera
  implements CameraImplements
{
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

  resize(width: number, height: number) {
    this.aspect = width / height;
    this.updateProjectionMatrix();
  }

  focusTarget<T extends Box3D>(target: T) {
    const bbox = this.getBoundingBox(target);
    const center = bbox.getCenter(new Vector3());
    this.position.set(0, 0, 100).add(center);
    this.lookAt(center);
  }

  getBoundingBox<T extends Box3D>(target: T) {
    if (!target.geometry.boundingBox) target.geometry.computeBoundingBox();
    const bbox = target.geometry.boundingBox!;
    const minProject = bbox.min.clone();
    const maxProject = bbox.max.clone();

    target.updateMatrixWorld();
    // 本地空间 ---> 世界空间
    minProject.applyMatrix4(target.matrixWorld);
    maxProject.applyMatrix4(target.matrixWorld);

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
