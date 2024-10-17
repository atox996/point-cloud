import type {
  Box3,
  Color,
  IUniform,
  Matrix4,
  Vector2Tuple,
  Vector3Like,
} from "three";

export type IGradient = { value: number; color: Color }[];

export interface IBox {
  bbox: Box3;
  matrix: Matrix4;
  color: Color;
  opacity: number;
}

export type ActiveMode =
  | "highlight"
  | "clip_in"
  | "clip_out"
  | "clip_out_highlight";

export type IParameters = {
  [K in IUniformKeys]?: IUniformValue<K>;
};

export type IUniforms = {
  sColor: IUniform<Color | null>;
  size: IUniform<number>;
  opacity: IUniform<number>;
  gradient: IUniform<IGradient>;
  gradientRange: IUniform<Vector2Tuple>;
  boxes: IUniform<IBox[]>;
  activeBoxes: IUniform<IBox[]>;
  activeMode: IUniform<`${ActiveMode}`>;
  clipMargin: IUniform<Vector3Like>;
};

export type IUniformKeys = keyof IUniforms;
export type IUniformValue<K extends IUniformKeys> = IUniforms[K]["value"];

export interface IDefines {
  use_raw_shader?: boolean;
  use_color?: boolean;

  use_gradient?: boolean;
  gradient_length: number;

  has_boxes?: boolean;
  boxes_length: number;

  has_active_boxes?: boolean;
  active_boxes_length: number;
}
