import Ember from 'ember';

import GlMatrix from 'npm:gl-matrix';
import shaders from 'webgl-cube-in-ember/ember-stringify';

import {
  programFromCompiledShadersAndUniformNames,
  configureBuffer
} from '../helpers/gl-helpers';

const ROTATION_SPEED = -0.007;
const UNIFORM_NAMES = [
  'modelMatrix',
  'viewMatrix',
  'projectionMatrix',
  'sampler'
];

const VERTICES = new Float32Array([
  // Back
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,

  // Front
  -1.0, -1.0, 1.0,
   1.0, -1.0, 1.0,
  -1.0,  1.0, 1.0,
  -1.0,  1.0, 1.0,
   1.0, -1.0, 1.0,
   1.0,  1.0, 1.0,

  // Right
  1.0, -1.0, -1.0,
  1.0, -1.0,  1.0,
  1.0,  1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0, -1.0,  1.0,
  1.0,  1.0,  1.0,

  //Left
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0, -1.0,
  -1.0,  1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Top
   1.0, 1.0, -1.0,
   1.0, 1.0,  1.0,
  -1.0, 1.0, -1.0,
   1.0, 1.0,  1.0,
  -1.0, 1.0,  1.0,
  -1.0, 1.0, -1.0,

  // Bottom
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,
  -1.0, -1.0, -1.0,
]);

const TEX_COORDS = new Float32Array([
  // Back
  1.0, 1.0,
  0.0, 1.0,
  1.0, 0.0,
  1.0, 0.0,
  0.0, 1.0,
  0.0, 0.0,

  // Front
  1.0, 0.0,
  0.0, 0.0,
  1.0, 1.0,
  1.0, 1.0,
  0.0, 0.0,
  0.0, 1.0,

  // Right
  1.0, 0.0,
  1.0, 1.0,
  0.0, 0.0,
  0.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,

  // Left
  1.0, 1.0,
  1.0, 0.0,
  0.0, 1.0,
  0.0, 1.0,
  1.0, 0.0,
  0.0, 0.0,

  // Top
  0.0, 1.0,
  0.0, 0.0,
  1.0, 1.0,
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,

  // Bottom
  0.0, 0.0,
  0.0, 1.0,
  1.0, 0.0,
  0.0, 1.0,
  1.0, 1.0,
  1.0, 0.0
]);

export default Ember.Component.extend({
  tagName: 'canvas',
  classNames: ['cube-canvas'],
  attributeBindings: ['width', 'height'],
  width: 250,
  height: 250,
  modelMatrix: GlMatrix.mat4.create(),
  viewMatrix: GlMatrix.mat4.create(),
  projectionMatrix: GlMatrix.mat4.create(),

  init() {
    this._super(...arguments);
    this.configureViewMatrix();
    this.configureProjectionMatrix();
    this.animate = this._animate.bind(this);
  },

  configureViewMatrix() {
    let viewMatrix = this.get('viewMatrix');
    GlMatrix.mat4.lookAt(viewMatrix, [0.0, 0.0, 3.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
  },

  configureProjectionMatrix() {
    let projectionMatrix = this.get('projectionMatrix');
    GlMatrix.mat4.perspective(projectionMatrix, 30.0, 1.0, 1.0, 100.0);
  },

  configureVerticesForCube(gl, program, vertices) {
    configureBuffer(gl, program, vertices, 3, 'position');
  },

  configureTextureMapForCube(gl, program, textureCoordinates) {
    configureBuffer(gl, program, textureCoordinates, 2, 'texCoord');
  },

  gl: Ember.computed(function() {
    let canvas = this.get('element');
    var context;

    if (canvas) {
      context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }

    return context;
  }),

  program: Ember.computed(function() {
    let gl = this.get('gl');
    let vertexShader = shaders['vertex.glsl'];
    let fragmentShader = shaders['fragment.glsl'];

    return programFromCompiledShadersAndUniformNames(
      gl,
      vertexShader,
      fragmentShader,
      UNIFORM_NAMES
    );
  }),

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', () => {
      if (this.get('gl')) {
        this.performInitialWebGlSetup();
      }
    });
  },

  performInitialWebGlSetup() {
    this.configureCanvas();
  },

  configureCanvas() {
    let gl = this.get('gl');
    if (gl) {
      this.clearGl(gl);
      this.configureGl(gl);
    }
  },

  downloadTextureImage(gl) {
    var image = new Image();
    var program = this.get('program');
    image.onload = () => this.handleDownloadedImageForTexture(gl, program, image);
    image.src = 'ember-logo.png';
  },

  handleDownloadedImageForTexture(gl, program, image) {
    var texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(program.uniformsCache['sampler'], 0);

    this.animate();
  },

  clearGl(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  },

  configureGl(gl) {
    let program = this.get('program');
    let modelMatrix = this.get('modelMatrix');
    let viewMatrix = this.get('viewMatrix');
    let projectionMatrix = this.get('projectionMatrix');

    gl.useProgram(program);
    gl.uniformMatrix4fv(program.uniformsCache['modelMatrix'], false, modelMatrix);
    gl.uniformMatrix4fv(program.uniformsCache['viewMatrix'], false, viewMatrix);
    gl.uniformMatrix4fv(program.uniformsCache['projectionMatrix'], false, projectionMatrix);
    this.configureVerticesForCube(gl, program, VERTICES);

    this.downloadTextureImage(gl);
    this.configureTextureMapForCube(gl, program, TEX_COORDS);
  },

  _animate() {
    let gl = this.get('gl');

    this.rotate(gl);
    this.draw(gl);
    window.requestAnimationFrame(this.animate);
  },

  rotate(gl) {
    let modelMatrix = this.get('modelMatrix');
    let program = this.get('program');
    GlMatrix.mat4.rotateX(modelMatrix, modelMatrix, ROTATION_SPEED);
    GlMatrix.mat4.rotateY(modelMatrix, modelMatrix, ROTATION_SPEED);
    GlMatrix.mat4.rotateZ(modelMatrix, modelMatrix, ROTATION_SPEED);
    gl.uniformMatrix4fv(program.uniformsCache['modelMatrix'], false, modelMatrix);
  },

  draw(gl) {
    this.clearGl(gl);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
});
