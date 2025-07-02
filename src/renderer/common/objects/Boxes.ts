import { BoxGeometry, DynamicDrawUsage, InstancedBufferAttribute, MeshBasicMaterial } from "three";

import InstancedMeshManagger from "@/renderer/utils/InstancedMeshManagger";

export default class Boxes extends InstancedMeshManagger {
  constructor(count = 1000) {
    super(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ wireframe: true }), count);
    this.mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(count * 3), 3);
    this.mesh.instanceColor.setUsage(DynamicDrawUsage);
    this.mesh.geometry.setAttribute("color", this.mesh.instanceColor);
  }
}
