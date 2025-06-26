import { RawShaderMaterial, Vector2 } from "three";

import { createBoxTexture, createLegacyJetTextureData, generateLegacyJetTextureData } from "../utils";
import fragmentShader from "./shaders/points.fs?raw";
import vertexShader from "./shaders/points.vs?raw";
// import fragmentShader from "./shaders/highlight.fs?raw";
// import vertexShader from "./shaders/highlight.vs?raw";

interface IDefines {
  USE_COLOR?: boolean;
  USE_GRADIENT_TEXTURE?: boolean;
  BOX_TEX_WIDTH?: number;
  BOX_COUNT?: number;
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

  private _boxTextureWidth = 1;

  private _boxCount = 1;

  constructor() {
    super({
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    this.uniforms = {
      /** 点大小 */
      size: makeUniform("f", 1.0),
      /** 亮度 */
      brightness: makeUniform("f", 1.0),
      /** 透明度 */
      opacity: makeUniform("f", 1.0),
      /** 纯色 */
      color: makeNullableUniform("v3", null),
      /** 渐变纹理: 优先级高于color */
      gradientTexture: makeNullableUniform("t", null),
      gradientRange: makeNullableUniform("v2", new Vector2(-7, 3)),
      /** 3D框纹理 */
      boxTexture: makeNullableUniform("t", null),
    };

    // 默认使用渐变纹理
    // const textureData = generateGradientTextureData();
    const textureData = generateLegacyJetTextureData();
    this.setGradientTexture(textureData);
  }

  setGradientTexture(data: Float32Array | null) {
    if (data === null) {
      this.uniforms.gradientTexture.value?.dispose();
      this.uniforms.gradientTexture.value = null;
    } else {
      const oldTexture = this.uniforms.gradientTexture.value;

      if (oldTexture?.image.data.length === data.length) {
        // 复用旧 texture，只替换数据
        oldTexture.image.data.set(data);
        oldTexture.needsUpdate = true;
      } else {
        // 创建新的纹理
        oldTexture?.dispose();

        const gradientTexture = createLegacyJetTextureData(data);

        this.uniforms.gradientTexture.value = gradientTexture;
      }
    }
  }

  setBoxTexture(data: null): void;
  setBoxTexture(data: Float32Array, width: number, height: number): void;
  setBoxTexture(data: Float32Array | null, width = 1, height = 1) {
    this._boxTextureWidth = width;
    this._boxCount = height;

    if (data === null) {
      this.uniforms.boxTexture.value?.dispose();
      this.uniforms.boxTexture.value = null;
    } else {
      const oldTexture = this.uniforms.boxTexture.value;

      if (oldTexture?.image.data.length === data.length) {
        // 复用旧 texture，只替换数据
        oldTexture.image.data.set(data);
        oldTexture.needsUpdate = true;
        this.update();
      } else {
        // 创建新的纹理
        oldTexture?.dispose();

        const boxTexture = createBoxTexture(data, width, height);

        this.uniforms.boxTexture.value = boxTexture;
      }
    }
  }

  update() {
    this.defines = {};
    if (this.uniforms.gradientTexture.value) {
      this.defines.USE_GRADIENT_TEXTURE = true;
    } else if (this.uniforms.color.value) {
      this.defines.USE_COLOR = true;
    }
    this.defines.BOX_TEX_WIDTH = this._boxTextureWidth;
    this.defines.BOX_COUNT = this._boxCount;

    this.needsUpdate = true;
  }
}
