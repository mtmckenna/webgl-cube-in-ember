attribute vec3 position;
attribute vec2 texCoord;
attribute vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
  vTexCoord = texCoord;
  vNormal = mat3(modelMatrix) * normal;
}

