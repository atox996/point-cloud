import {
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
} from "three";

const geometry = new EdgesGeometry(new BoxGeometry());
const material = new LineBasicMaterial();

export default class Box3D extends LineSegments {
  declare geometry: EdgesGeometry<BoxGeometry>;
  declare material: LineBasicMaterial;

  constructor() {
    super(geometry.clone(), material.clone());
  }
}
