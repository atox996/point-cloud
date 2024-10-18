import type { BufferGeometry, Object3D } from "three";

export interface Box3D extends Object3D {
  geometry: BufferGeometry;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type PositiveAxis<T> = T extends `-${infer _}` ? never : T;
