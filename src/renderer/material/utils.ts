import { CanvasTexture, Color, LinearFilter, type Texture } from "three";
import type { IGradient } from "./types";

export function generateGradientTexture(gradient: IGradient = []): Texture {
  const size = 64;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d")!;

  context.rect(0, 0, size, size);
  const ctxGradient = context.createLinearGradient(0, 0, size, size);

  for (let i = 0; i < gradient.length; i++) {
    const step = gradient[i];
    const color = step[1] instanceof Color ? step[1] : new Color(step[1]);
    ctxGradient.addColorStop(step[0], `#${color.getHexString()}`);
  }

  context.fillStyle = ctxGradient;
  context.fill();

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;

  texture.minFilter = LinearFilter;
  // textureImage = texture.image;

  return texture;
}

export function uniform(target: object, propertyKey: string | symbol) {
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
