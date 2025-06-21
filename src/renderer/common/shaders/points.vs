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
uniform float brightness;

varying vec3 vColor;

void main() {
  vColor = vec3(color * brightness);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size;
}