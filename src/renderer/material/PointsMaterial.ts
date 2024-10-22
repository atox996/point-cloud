import { Color, RawShaderMaterial } from "three";

import vertexShader from "./shaders/points.vs?raw";
import fragmentShader from "./shaders/points.fs?raw";
import type {
  IUniforms,
  IDefines,
  IParameters,
  IUniformValue,
  IUniformKeys,
} from "./types";

export default class PointsMaterial extends RawShaderMaterial {
  @uniform declare size: IUniformValue<"size">;
  @uniform declare opacity: IUniformValue<"opacity">;
  @uniform declare colorMode: IUniformValue<"colorMode">;
  @uniform declare sColor: IUniformValue<"sColor">;
  @uniform declare gradient: IUniformValue<"gradient">;
  @uniform declare gradientRange: IUniformValue<"gradientRange">;
  @uniform declare boxes: IUniformValue<"boxes">;
  @uniform declare activeBoxes: IUniformValue<"activeBoxes">;
  @uniform declare activeMode: IUniformValue<"activeMode">;
  @uniform declare cutPadding: IUniformValue<"cutPadding">;

  uniforms: IUniforms = {
    size: { value: 1 },
    opacity: { value: 1 },
    colorMode: { value: 0 },
    sColor: { value: new Color(0xffffff) },
    gradient: { value: [] },
    gradientRange: { value: [0, 1] },
    boxes: { value: [] },
    activeBoxes: { value: [] },
    activeMode: { value: 0 },
    cutPadding: { value: 0 },
  };

  defines = {} as IDefines;

  constructor(parameters: IParameters = {}) {
    super({
      vertexShader,
      fragmentShader,
    });

    this.size = parameters.size ?? this.getUniform("size");
    this.opacity = parameters.opacity ?? this.getUniform("opacity");
    this.colorMode = parameters.colorMode ?? this.getUniform("colorMode");
    this.sColor = parameters.sColor ?? this.getUniform("sColor");
    this.gradient = parameters.gradient ?? this.getUniform("gradient");
    this.gradientRange =
      parameters.gradientRange ?? this.getUniform("gradientRange");
    this.boxes = parameters.boxes ?? this.getUniform("boxes");
    this.activeBoxes = parameters.activeBoxes ?? this.getUniform("activeBoxes");
    this.activeMode = parameters.activeMode ?? this.getUniform("activeMode");
    this.cutPadding = parameters.cutPadding ?? this.getUniform("cutPadding");

    this.transparent = true;

    this.update();
  }

  getUniform<K extends IUniformKeys>(name: K): IUniformValue<K> {
    return this.uniforms?.[name].value;
  }
  setUniform<K extends IUniformKeys>(name: K, value: IUniformValue<K>) {
    if (!this.uniforms) return;

    this.uniforms[name].value = value;

    this.update();
  }

  update() {
    this.defines = {};

    if ("isRawShaderMaterial" in this) {
      this.defines.use_raw_shader = true;
    }

    if (this.gradient.length) {
      this.defines.gradient_length = this.gradient.length;
    }

    if (this.boxes.length) {
      this.defines.boxes_length = this.boxes.length;
    }

    if (this.activeBoxes.length) {
      this.defines.active_boxes_length = this.activeBoxes.length;
    }

    this.needsUpdate = true;
  }
}

function uniform(target: object, propertyKey: string | symbol) {
  Object.defineProperty(target, propertyKey, {
    get() {
      return this.getUniform(propertyKey);
    },
    set(value) {
      if (value !== this.getUniform(propertyKey)) {
        this.setUniform(propertyKey, value);
      }
    },
  });
}
