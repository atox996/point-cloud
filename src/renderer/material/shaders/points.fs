precision mediump float;
precision mediump int;

uniform float opacity;

varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, opacity);
}
