#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vColor;
varying vec2 vTexCoord;

uniform sampler2D sampler;

void main() {
  gl_FragColor = texture2D(sampler, vTexCoord);
}

