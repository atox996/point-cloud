import {
  Color,
  RawShaderMaterial,
  type ColorRepresentation,
  type Vector2Tuple,
} from "three";

import vertexShader from "./shaders/points.vs?raw";
import fragmentShader from "./shaders/points.fs?raw";
import type {
  IUniforms,
  IDefines,
  IParameters,
  IGradient,
  IUniformKeys,
} from "./types";
import { generateGradientTexture, uniform } from "./utils";

export default class PointsMaterial extends RawShaderMaterial {
  #color?: ColorRepresentation;

  #gradient: IGradient = [];
  #gradientTexture = generateGradientTexture();

  @uniform declare color?: ColorRepresentation;
  @uniform declare size: number;
  @uniform declare opacity: number;
  @uniform declare gradient: IGradient;
  @uniform declare gradientRange: Vector2Tuple;

  uniforms: IUniforms = {
    uColor: { value: null },
    size: { value: 1 },
    opacity: { value: 1 },
    gradient: { value: null },
    gradientRange: { value: [0, 1] },
  };

  defines: IDefines = {};

  constructor(parameters: IParameters = {}) {
    super({
      vertexShader,
      fragmentShader,
    });

    this.color = parameters.color ?? this.#color;
    this.size = parameters.size ?? this.uniforms.size.value;
    this.opacity = parameters.opacity ?? this.uniforms.opacity.value;
    this.gradient = parameters.gradient ?? this.#gradient;
    this.gradientRange =
      parameters.gradientRange ?? this.uniforms.gradientRange.value;

    this.transparent = true;

    this.update();
  }

  getUniform<K extends IUniformKeys>(name: K) {
    switch (name) {
      case "color":
        return this.#color;
      case "gradient":
        return this.#gradient;
      default:
        return this.uniforms?.[name].value;
    }
  }

  setUniform<K extends IUniformKeys>(name: K, value: IUniforms[K]["value"]) {
    if (!this.uniforms) return;
    switch (name) {
      case "color":
        this.#color = value;
        if (this.uniforms.uColor.value) {
          this.uniforms.uColor.value.set(value);
        } else if (value) {
          this.uniforms.uColor.value = new Color(value);
        }
        break;
      case "gradient":
        if (this.#gradient !== value) {
          this.#gradient = value;
          this.#gradientTexture.dispose();
          this.#gradientTexture = generateGradientTexture(value);
          this.uniforms.gradient.value = this.#gradientTexture;
        }
        break;
      default:
        this.uniforms[name].value = value;
    }
    this.update();
  }

  update() {
    this.defines = {
      use_raw_shader: "isRawShaderMaterial" in this,
      use_color: !this.gradient.length && !!this.#color,
      use_gradient: !!this.gradient.length,
    };

    this.needsUpdate = true;
  }

  dispose(): void {
    this.#gradientTexture.dispose();

    super.dispose();
  }
}
