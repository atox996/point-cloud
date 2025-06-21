precision highp float;

uniform float opacity;

varying vec3 vColor;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  if(length(coord) > 0.5) discard;

  gl_FragColor = vec4(vColor * opacity, opacity);
}
