#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform sampler2D sampler;
uniform vec3 reverseLightDirection;

void main() {
  vec3 normal = normalize(vNormal);
  float light = dot(normal, reverseLightDirection);

  mediump vec4 texelColor = texture2D(sampler, vec2(vTexCoord.s, vTexCoord.t));
  gl_FragColor = vec4(texelColor.rgb * light, texelColor.a);
}

