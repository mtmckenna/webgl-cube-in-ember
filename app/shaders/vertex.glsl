attribute vec3 position;
attribute vec2 texCoord;
attribute vec3 color;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
varying vec3 vColor;
varying vec2 vTexCoord;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
  vColor = color;
  vTexCoord = texCoord;
}

