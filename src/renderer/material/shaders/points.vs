precision mediump float;
precision mediump int;

#ifdef use_raw_shader
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
  attribute vec3 color;
#endif

#ifdef use_gradient
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
      for (int i = 0; i < gradient_length; i++) {
        if (zNormalized >= gradient[i].value && zNormalized <= gradient[i + 1].value) {
          float t = (zNormalized - gradient[i].value) / (gradient[i + 1].value - gradient[i].value);
          finalColor = mix(gradient[i].color, gradient[i+1].color, t);
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

#ifdef has_boxes
  uniform BoxesItem boxes[boxes_length];
#endif

#ifdef has_active_boxes
  uniform BoxesItem activeBoxes[active_boxes_length];
#endif

#ifndef highlight
  uniform vec3 clipMargin;
#endif

uniform float size;
uniform vec3 sColor;
uniform float opacity;

varying vec3 vColor;
varying float vOpacity;

bool isInBox(vec3 pos, vec3 min, vec3 max){
  return pos.x >= min.x && pos.x <= max.x && pos.y >= min.y && pos.y <= max.y && pos.z >= min.z && pos.z <= max.z;
}

void main() {
  gl_PointSize = size;

  vOpacity = opacity;

  vColor = color;
  #ifdef use_color
    vColor = sColor;
  #elif defined use_gradient
    vColor = getGradientByZ();
  #endif
  
  #ifdef has_boxes
    for (int i = 0; i < boxes_length; i++) {
      BoxesItem box = boxes[i];
      vec4 boxPos = box.matrix * vec4(position, 1.0);
      if (isInBox(boxPos.xyz, box.bbox.min, box.bbox.max)) {
        vColor = box.color;
        vOpacity = box.opacity;
        break;
      }
    }
  #endif
  
  #ifdef has_active_boxes
    bool insideBox = false;
    for (int i = 0; i < active_boxes_length; i++) {
      BoxesItem box = activeBoxes[i];
      vec4 boxPos = box.matrix * vec4(position, 1.0);
      vec3 min = box.bbox.min;
      vec3 max = box.bbox.max;
      #ifndef highlight
        min -= clipMargin;
        max += clipMargin;
      #endif
      if (isInBox(boxPos.xyz, min, max)) {
        insideBox = true;
        #if defined(highlight) || defined(clip_out_highlight)
          vColor = box.color;
          vOpacity = box.opacity;
        #endif
        break;
      }
    }
    #if defined(clip_out) || defined(clip_out_highlight)
      if (!insideBox) {
        vOpacity = 0.0;
      }
    #elif defined clip_in
      if (insideBox) {
        vOpacity = 0.0;
      }
    #endif
  #endif
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
