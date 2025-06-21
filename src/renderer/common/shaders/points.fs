precision highp float;

varying vec4 vFragColor;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  if(length(coord) > 0.5) discard;

  gl_FragColor = vFragColor;
}
