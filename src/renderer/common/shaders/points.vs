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

varying vec3 vColor;

void main() {
  #ifdef USE_GRADIENT_TEXTURE
    float range = max(gradientRange.y - gradientRange.x, 1e-6);
    float t = clamp((position.z - gradientRange.x) / range, 0.0, 1.0);
    vColor = texture2D(gradientTexture, vec2(t, 0.5)).rgb;
  #else
    vColor = color;
  #endif

  vColor *= brightness;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size;
}
