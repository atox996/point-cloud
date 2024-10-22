precision mediump float;
precision mediump int;

#ifdef use_raw_shader
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
  attribute vec3 color;
#endif

#ifdef gradient_length
  struct GradientItem {
    float value;
    vec3 color;
  };
  uniform GradientItem gradient[gradient_length];
  uniform vec2 gradientRange;

  vec3 getGradientByZ() {
    float zNormalized = (position.z - gradientRange.x) / (gradientRange.y-gradientRange.x);
    zNormalized = clamp(zNormalized, 0.0, 1.0);
    
    vec3 finalColor;
    if (zNormalized < gradient[0].value) {
      finalColor = gradient[0].color;
    } else if (zNormalized > gradient[gradient_length-1].value) {
      finalColor = gradient[gradient_length-1].color;
    } else {
      for (int i = 0; i < gradient_length - 1; i++) {
        if (zNormalized >= gradient[i].value && zNormalized <= gradient[i + 1].value) {
          float t = (zNormalized - gradient[i].value) / (gradient[i + 1].value - gradient[i].value);
          finalColor = mix(gradient[i].color, gradient[i + 1].color, t);
          break;
        }
      }
    }
    return finalColor;
  }
#endif

struct BBox {
  vec3 min;
  vec3 max;
};

struct BoxesItem {
  BBox bbox;
  mat4 matrix;
  vec3 color;
  float opacity;
};

#ifdef boxes_length
  uniform BoxesItem boxes[boxes_length];
#endif

#ifdef active_boxes_length
  uniform BoxesItem activeBoxes[active_boxes_length];
#endif


uniform float size;
uniform float opacity;
uniform int colorMode;
uniform vec3 sColor;
uniform int activeMode;
uniform float cutPadding;

varying vec3 vColor;
varying float vOpacity;

bool isInBox(vec3 pos, vec3 min, vec3 max){
  return pos.x >= min.x && pos.x <= max.x && pos.y >= min.y && pos.y <= max.y && pos.z >= min.z && pos.z <= max.z;
}

void main() {
  gl_PointSize = size;

  vOpacity = opacity;

  vColor = color;
  if (colorMode == 1) {
    vColor = sColor;
  } else if (colorMode == 2) {
    #ifdef gradient_length
      vColor = getGradientByZ();
    #endif
  }
  
  #ifdef boxes_length
    for (int i = 0; i < boxes_length; i++) {
      BoxesItem box = boxes[i];
      vec3 min = box.bbox.min;
      vec3 max = box.bbox.max;
      vec4 boxPos = box.matrix * vec4(position, 1.0);
      if (isInBox(boxPos.xyz, min, max)) {
        vColor = box.color;
        vOpacity = box.opacity;
      }
    }
  #endif

  #ifdef active_boxes_length
    bool insideBox = false;
    for (int i = 0; i < active_boxes_length; i++) {
      BoxesItem box = activeBoxes[i];
      vec3 min = box.bbox.min;
      vec3 max = box.bbox.max;
      vec4 boxPos = box.matrix * vec4(position, 1.0);
      if (isInBox(boxPos.xyz, min, max)) {
        insideBox = true;
        vColor = box.color;
        vOpacity = box.opacity;
        break;
      }
      if (activeMode == 1 || activeMode == 2) {
        vec3 cutPaddingMin = min - vec3(cutPadding);
        vec3 cutPaddingMax = max + vec3(cutPadding);
        if (isInBox(boxPos.xyz, cutPaddingMin, cutPaddingMax)) {
          insideBox = true;
          break;
        }
      }
    }
    if (activeMode == 1 && insideBox || activeMode == 2 && !insideBox) {
      vOpacity = 0.0;
    }
  #endif
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
