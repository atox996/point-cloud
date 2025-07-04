import { type Intersection, LineSegments, Matrix4, Ray, Raycaster, Sphere, Vector3 } from "three";

const _reusableSphere = new Sphere();
const _reusableMatrix4 = new Matrix4();
const _resuableRay = new Ray();
const _reusableVector3 = new Vector3();
export function lineSegmentsRaycast(this: LineSegments, raycaster: Raycaster, intersects: Intersection[]) {
  const { geometry } = this;
  const { matrixWorld } = this;
  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  const _sphere = _reusableSphere.copy(geometry.boundingSphere!);
  _sphere.applyMatrix4(matrixWorld);

  if (raycaster.ray.intersectsSphere(_sphere) === false) return;

  const _inverseMatrix = _reusableMatrix4.copy(matrixWorld).invert();
  const _ray = _resuableRay.copy(raycaster.ray).applyMatrix4(_inverseMatrix);

  if (geometry.boundingBox === null) geometry.computeBoundingBox();

  if (_ray.intersectsBox(geometry.boundingBox!) === false) return;

  const pos = _reusableVector3.set(0, 0, 0).applyMatrix4(matrixWorld);
  const distance = pos.distanceTo(raycaster.ray.origin);
  intersects.push({ object: this, distance, point: pos });
}
