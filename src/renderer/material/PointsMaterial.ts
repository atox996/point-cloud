import { RawShaderMaterial, type IUniform } from "three";

import vertexShader from "./shaders/points.vert?raw";
import fragmentShader from "./shaders/points.frag?raw";

interface IUniforms {
  size: IUniform<number>;
  opacity: IUniform<number>;
}

type UniformKey = keyof IUniforms;

export default class PointMaterial extends RawShaderMaterial {
  @uniform("size") declare size: number;
  @uniform("opacity") declare opacity: number;

  constructor() {
    super({
      uniforms: {
        size: { value: 1 },
        opacity: { value: 1 },
      },
    });

    this.update();
  }

  update() {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.needsUpdate = true;
  }

  getUniform<K extends UniformKey>(key: K): IUniforms[K]["value"] {
    return this.uniforms?.[key].value;
  }

  setUniform<K extends UniformKey>(key: K, value: IUniforms[K]["value"]) {
    if (!this.uniforms) return;
    this.uniforms[key].value = value;
  }
}

function uniform<K extends UniformKey>(
  uniformName: K,
  requireSrcUpdate = true,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    Object.defineProperty(target, propertyKey, {
      get() {
        return this.getUniform(uniformName);
      },
      set(value) {
        if (value !== this.getUniform(uniformName)) {
          this.setUniform(uniformName, value);
          if (requireSrcUpdate) {
            this.update();
          }
        }
      },
    });
  };
}
