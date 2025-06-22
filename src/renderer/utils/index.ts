import { Matrix4, Vector3 } from "three";

export interface Intrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
}

export interface CameraParameters {
  intrinsics: Intrinsics;
  extrinsics: number[]; // 列主序 4x4 矩阵数组
}

/**
 * 标准化来自多种来源的相机参数对象
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCameraParameters(raw: any): CameraParameters {
  const intrinsics = normalizeIntrinsics(raw);
  const extrinsics = normalizeExtrinsics(raw);
  return { intrinsics, extrinsics };
}

/**
 * 提取内参
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeIntrinsics(raw: any): Intrinsics {
  if (raw.P && Array.isArray(raw.P)) {
    return {
      fx: raw.P[0][0],
      fy: raw.P[1][1],
      cx: raw.P[0][2],
      cy: raw.P[1][2],
    };
  }

  throw new Error("Unsupported intrinsics format");
}

/**
 * 提取并转换外参为列主序 4x4 数组
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeExtrinsics(raw: any): number[] {
  if (raw.T && Array.isArray(raw.T)) {
    const T = raw.T;
    const mat = [
      T[0][0],
      T[1][0],
      T[2][0],
      0, // 第1列：X轴方向
      T[0][1],
      T[1][1],
      T[2][1],
      0, // 第2列：Y轴方向
      T[0][2],
      T[1][2],
      T[2][2],
      0, // 第3列：Z轴方向
      T[0][3],
      T[1][3],
      T[2][3],
      1, // 第4列：平移向量
    ];
    return mat;
  }

  throw new Error("Unsupported extrinsics format");
}

export function extractCameraPositionAndDirection(extrinsics: number[]) {
  const matrix = new Matrix4().fromArray(extrinsics); // 列主序
  const matrixWorld = matrix.clone().invert(); // M_wc

  // 提取位置
  const position = new Vector3().setFromMatrixPosition(matrixWorld);

  // 提取 -Z 方向（即相机朝前）
  const zAxis = new Vector3()
    .set(
      matrixWorld.elements[8], // 第三列 x
      matrixWorld.elements[9], // 第三列 y
      matrixWorld.elements[10], // 第三列 z
    )
    .negate()
    .normalize(); // -Z 即朝前

  return { position, direction: zAxis };
}
