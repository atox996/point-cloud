precision mediump float;
precision mediump int;

#ifdef use_raw_shader
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
  attribute vec3 color;
#endif

uniform float size;
uniform vec3 uColor;
uniform float opacity;
uniform sampler2D gradient;
uniform vec2 gradientRange;

varying vec3 vColor;
varying float vOpacity;

vec3 getGradientByZ() {
	float w = (position.z - gradientRange.x) / (gradientRange.y-gradientRange.x);
	vec3 cGradient = texture2D(gradient, vec2(w,1.0-w)).rgb;

	return cGradient;
}

void main() {
  gl_PointSize = size;

  vOpacity = opacity;

  vColor = color;
  #ifdef use_color
    vColor = uColor;
  #elif defined use_gradient
    vColor = getGradientByZ();
  #endif
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
