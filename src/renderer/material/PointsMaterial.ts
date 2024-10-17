import { RawShaderMaterial, Vector3 } from "three";

import vertexShader from "./shaders/points.vs?raw";
import fragmentShader from "./shaders/points.fs?raw";
import type {
  IUniforms,
  IDefines,
  IParameters,
  IUniformValue,
  IUniformKeys,
} from "./types";
import { uniform } from "./utils";

export default class PointsMaterial extends RawShaderMaterial {
  @uniform declare sColor: IUniformValue<"sColor">;
  @uniform declare size: IUniformValue<"size">;
  @uniform declare opacity: IUniformValue<"opacity">;
  @uniform declare gradient: IUniformValue<"gradient">;
  @uniform declare gradientRange: IUniformValue<"gradientRange">;
  @uniform declare boxes: IUniformValue<"boxes">;
  @uniform declare activeBoxes: IUniformValue<"activeBoxes">;
  @uniform declare activeMode: IUniformValue<"activeMode">;
  @uniform declare clipMargin: IUniformValue<"clipMargin">;

  uniforms: IUniforms = {
    sColor: { value: null },
    size: { value: 1 },
    opacity: { value: 1 },
    gradient: { value: [] },
    gradientRange: { value: [0, 1] },
    boxes: { value: [] },
    activeBoxes: { value: [] },
    activeMode: { value: "highlight" },
    clipMargin: { value: new Vector3(1, 1, 1) },
  };

  defines = {} as IDefines;

  constructor(parameters: IParameters = {}) {
    super({
      vertexShader,
      fragmentShader,
    });

    this.sColor = parameters.sColor ?? this.getUniform("sColor");
    this.size = parameters.size ?? this.getUniform("size");
    this.opacity = parameters.opacity ?? this.getUniform("opacity");
    this.gradient = parameters.gradient ?? this.getUniform("gradient");
    this.gradientRange =
      parameters.gradientRange ?? this.getUniform("gradientRange");
    this.boxes = parameters.boxes ?? this.getUniform("boxes");
    this.activeBoxes = parameters.activeBoxes ?? this.getUniform("activeBoxes");
    this.activeMode = parameters.activeMode ?? this.getUniform("activeMode");
    this.clipMargin = parameters.clipMargin ?? this.getUniform("clipMargin");

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
    this.defines = {
      use_raw_shader: "isRawShaderMaterial" in this,
      use_color: !this.gradient.length && !!this.getUniform("sColor"),

      use_gradient: !!this.gradient.length,
      gradient_length: this.gradient.length,

      has_boxes: !!this.boxes.length,
      boxes_length: this.boxes.length,

      has_active_boxes: !!this.activeBoxes.length,
      active_boxes_length: this.activeBoxes.length,

      [this.activeMode]: true,
    };

    this.needsUpdate = true;
  }
}
