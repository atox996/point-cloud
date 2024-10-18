import { Box3, Vector3, type Camera } from "three";
import type { Box3D } from "../typings";

/**
 * 获取物体在相机视图中的包围盒
 * @param box 3D对象
 * @param camera 相机
 * @returns {Box3} 相机视图包围盒
 */
export function getBoundingBoxInCameraView(box: Box3D, camera: Camera): Box3 {
  if (!box.geometry.boundingBox) box.geometry.computeBoundingBox();
  const bbox = box.geometry.boundingBox!;
  const minProject = bbox.min.clone();
  const maxProject = bbox.max.clone();

  box.updateMatrixWorld();
  camera.updateMatrixWorld();
  // 本地空间 ---> 世界空间 ---> 相机视图空间
  minProject
    .applyMatrix4(box.matrixWorld)
    .applyMatrix4(camera.matrixWorldInverse);
  maxProject
    .applyMatrix4(box.matrixWorld)
    .applyMatrix4(camera.matrixWorldInverse);

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

/**
 * 获取轴向
 * @param up 向量
 * @returns 轴向
 */
export function getUpAxis(up: Vector3) {
  const axis = up.clone().normalize();
  const maxComponent = Math.max(
    Math.abs(axis.x),
    Math.abs(axis.y),
    Math.abs(axis.z),
  );
  if (maxComponent === Math.abs(axis.x)) return "x";
  if (maxComponent === Math.abs(axis.y)) return "y";
  return "z";
}
