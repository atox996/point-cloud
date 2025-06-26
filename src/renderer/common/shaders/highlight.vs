precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform float size;
uniform float brightness;

attribute vec3 position;

#ifdef USE_GRADIENT_TEXTURE
  uniform sampler2D gradientTexture;
  uniform vec2 gradientRange;
#elif defined(USE_COLOR)
  uniform vec3 color;
#else
  attribute vec3 color;
#endif

uniform sampler2D boxTexture;

varying vec3 vColor;

vec4 getBoxTexel(int boxIndex, int texelOffset) {
  float u = (float(texelOffset) + 0.5) / float(BOX_TEX_WIDTH);
  float v = (float(boxIndex) + 0.5) / float(BOX_COUNT);
  return texture2D(boxTexture, vec2(u, v));
}

// 判断点是否在某box内部
bool pointInsideBox(vec3 pos, int boxIndex) {
  // 读取 boxMin 和 boxMax
  vec4 t0 = getBoxTexel(boxIndex, 0);
  vec4 t1 = getBoxTexel(boxIndex, 1);
  vec4 t2 = getBoxTexel(boxIndex, 2);
  vec4 t3 = getBoxTexel(boxIndex, 3);
  vec4 t4 = getBoxTexel(boxIndex, 4);
  vec4 t5 = getBoxTexel(boxIndex, 5);

  vec3 boxMin = t0.rgb;
  vec3 boxMax = vec3(t0.a, t1.r, t1.g);

  mat4 invMat;
  invMat[0] = t2;
  invMat[1] = t3;
  invMat[2] = t4;
  invMat[3] = t5;

  vec4 localPos = invMat * vec4(pos, 1.0);

  return all(greaterThanEqual(localPos.xyz, boxMin)) &&
         all(lessThanEqual(localPos.xyz, boxMax));
}

vec3 getBoxColor(int boxIndex) {
  vec4 t6 = getBoxTexel(boxIndex, 6);
  return t6.rgb * t6.a;  // RGB 是 color，A 是 opacity，可选用
}

void main() {
  bool hitBox = false;
  vec3 finalColor;

  // Box高亮逻辑
  for (int i = 0; i < BOX_COUNT; i++) {
    if (pointInsideBox(position, i)) {
      finalColor = getBoxColor(i);
      hitBox = true;
      break;  // 只处理第一个包含此点的 box
    }
  }

  if (hitBox) {
    vColor = finalColor;
  } else {
    #ifdef USE_GRADIENT_TEXTURE
      float range = max(gradientRange.y - gradientRange.x, 1e-6);
      float t = clamp((position.z - gradientRange.x) / range, 0.0, 1.0);
      vColor = texture2D(gradientTexture, vec2(t, 0.5)).rgb;
    #else
      vColor = color;
    #endif
  }

  vColor *= brightness;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size;
}
