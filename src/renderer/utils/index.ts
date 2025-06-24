import type { ColorRepresentation, Vector3Like } from "three";

import Box3D from "../common/objects/Box3D";

export const createBox3D = <T extends EmptyObject = EmptyObject>(
  center: Vector3Like,
  size: Vector3Like,
  rotation: Vector3Like,
  color: ColorRepresentation,
  userData?: T,
) => {
  const box3D = new Box3D();
  box3D.position.copy(center);
  box3D.scale.copy(size);
  box3D.rotation.set(rotation.x, rotation.y, rotation.z);
  box3D.color.set(color);
  box3D.userData = userData || {};
  return box3D;
};
