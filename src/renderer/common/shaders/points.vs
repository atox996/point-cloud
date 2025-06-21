precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;
#ifdef USE_COLOR
  uniform vec3 color;
#else
  attribute vec3 color;
#endif

uniform float size;
uniform float intensity;
uniform float opacity;

varying vec4 vFragColor;

void main() {
  vFragColor = vec4(color * intensity, opacity);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size;
}