import type { Box3, Color, IUniform, Matrix4, Vector2Tuple } from "three";

export enum ColorMode {
  RGB,
  SINGLE,
  GRADIENT,
}

export type IGradient = { value: number; color: Color };

export interface IBox {
  bbox: Box3;
  matrix: Matrix4;
  color: Color;
  opacity: number;
}

export enum ActiveMode {
  HIGHLIGHT,
  CUT_INSIDE,
  CUT_OUTSIDE,
}

export type IParameters = {
  [K in IUniformKeys]?: IUniformValue<K>;
};

export type IUniforms = {
  size: IUniform<number>;
  opacity: IUniform<number>;
  colorMode: IUniform<ColorMode>;
  sColor: IUniform<Color>;
  gradient: IUniform<IGradient[]>;
  gradientRange: IUniform<Vector2Tuple>;
  boxes: IUniform<IBox[]>;
  activeBoxes: IUniform<IBox[]>;
  activeMode: IUniform<ActiveMode>;
  cutPadding: IUniform<number>;
};

export type IUniformKeys = keyof IUniforms;
export type IUniformValue<K extends IUniformKeys> = IUniforms[K]["value"];

export interface IDefines {
  use_raw_shader?: boolean;

  gradient_length?: number;
  boxes_length?: number;
  active_boxes_length?: number;
}
