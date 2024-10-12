import type {
  Color,
  ColorRepresentation,
  IUniform,
  Texture,
  Vector2Tuple,
} from "three";

export type IGradient = [number, ColorRepresentation][];

export interface IParameters {
  color?: ColorRepresentation;
  size?: number;
  opacity?: number;
  gradient?: IGradient;
  gradientRange?: Vector2Tuple;
}

export interface IUniforms extends Record<string, IUniform> {
  uColor: IUniform<Color | null>;
  size: IUniform<number>;
  opacity: IUniform<number>;
  gradient: IUniform<Texture | null>;
  gradientRange: IUniform<Vector2Tuple>;
}

export type IUniformKeys = keyof IUniforms;

export interface IDefines {
  use_raw_shader?: boolean;
  use_color?: boolean;
  use_gradient?: boolean;
}
