import { RawShaderMaterial } from "three";

import fragmentShader from "./shaders/points.fs?raw";
import vertexShader from "./shaders/points.vs?raw";

interface IDefines {
  USE_COLOR?: boolean;
}

function makeUniform<T extends keyof UniformValueMap>(type: T, value: UniformValueMap[T]) {
  return { type, value };
}

function makeNullableUniform<T extends keyof UniformValueMap>(type: T, value: UniformValueMap[T] | null) {
  return { type, value };
}

function watchUniforms(execute: (ctx: PointsMaterial) => void) {
  return function (target: PointsMaterial, propertyKey: string) {
    const privateKey = Symbol();

    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get() {
        return this[privateKey];
      },
      set(value) {
        for (const key in value) {
          const uniform = value[key];

          value[key] = new Proxy(uniform, {
            set: (targetUniform, prop, val, receiver) => {
              if (prop === "type") {
                console.warn(`${propertyKey}.${key}.type is readonly`);
                return true;
              }
              const result = Reflect.set(targetUniform, prop, val, receiver);
              execute(this);
              return result;
            },
          });
        }

        this[privateKey] = value;
      },
    });
  };
}

export default class PointsMaterial extends RawShaderMaterial {
  @watchUniforms((ctx) => ctx.update()) declare uniforms;

  defines: IDefines = {};

  constructor() {
    super({
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    this.uniforms = {
      /** 点大小 */
      size: makeUniform("c", 1.0),
      /** 颜色强度 */
      intensity: makeUniform("c", 1.0),
      /** 透明度 */
      opacity: makeUniform("c", 1.0),
      /** 颜色 */
      color: makeNullableUniform("v3", null),
    };
  }

  update() {
    this.defines = {};
    if (this.uniforms.color.value) {
      this.defines.USE_COLOR = true;
    }
  }
}
