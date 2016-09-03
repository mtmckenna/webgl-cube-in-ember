import Ember from 'ember';
import GlMatrix from 'npm:gl-matrix';

import shaders from 'webgl-cube-in-ember/ember-stringify';

import {
  VERTICES,
  NUM_VERTICES,
  TEX_COORDS
} from './cube-data';

import {
  programFromCompiledShadersAndUniformNames,
  configureBuffer
} from '../helpers/gl-helpers';

const HEIGHT = 250;
const WIDTH = 250;
const ASPECT_RATIO = WIDTH / HEIGHT;
const CAMERA_DISTANCE = 3.0;
const NEAR_BOUND = 1.0;
const FAR_BOUND = 100.0;
const FOV = 30.0;
const ROTATION_SPEED = -0.007;
const UNIFORM_NAMES = [
  'modelMatrix',
  'viewMatrix',
  'projectionMatrix',
  'sampler'
];

export default Ember.Component.extend({
  tagName: 'canvas',
  attributeBindings: ['width', 'height'],
  width: WIDTH,
  height: HEIGHT,
  modelMatrix: GlMatrix.mat4.create(),
  viewMatrix: GlMatrix.mat4.create(),
  projectionMatrix: GlMatrix.mat4.create(),

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

  init() {
    this._super(...arguments);
    this.animate = this._animate.bind(this);
  },

  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', () => {
      let gl = this.get('gl');
      this.configureGl(gl);
    });
  },

  configureGl(gl) {
    this.configureViewMatrix();
    this.configureProjectionMatrix();

    let program = this.get('program');
    gl.useProgram(program);

    this.configureUniforms(gl, program);
    this.configureVerticesForCube(gl, program, VERTICES);
    this.configureTextureMapForCube(gl, program, TEX_COORDS);

    this.downloadTextureImage(gl);
  },

  configureViewMatrix() {
    let viewMatrix = this.get('viewMatrix');
    GlMatrix.mat4.lookAt(
      viewMatrix,
      [0.0, 0.0, CAMERA_DISTANCE],
      [0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0]);
  },

  configureProjectionMatrix() {
    let projectionMatrix = this.get('projectionMatrix');
    GlMatrix.mat4.perspective(
      projectionMatrix,
      FOV,
      ASPECT_RATIO,
      NEAR_BOUND,
      FAR_BOUND
    );
  },

  configureUniforms(gl, program) {
    let modelMatrix = this.get('modelMatrix');
    let viewMatrix = this.get('viewMatrix');
    let projectionMatrix = this.get('projectionMatrix');

    gl.uniformMatrix4fv(program.uniformsCache['modelMatrix'], false, modelMatrix);
    gl.uniformMatrix4fv(program.uniformsCache['viewMatrix'], false, viewMatrix);
    gl.uniformMatrix4fv(program.uniformsCache['projectionMatrix'], false, projectionMatrix);
  },

  configureVerticesForCube(gl, program, vertices) {
    configureBuffer(gl, program, vertices, 3, 'position');
  },

  configureTextureMapForCube(gl, program, textureCoordinates) {
    configureBuffer(gl, program, textureCoordinates, 2, 'texCoord');
  },

  downloadTextureImage(gl) {
    let image = new Image();
    let program = this.get('program');
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

  rotate(gl) {
    let modelMatrix = this.get('modelMatrix');
    let program = this.get('program');
    GlMatrix.mat4.rotateX(modelMatrix, modelMatrix, ROTATION_SPEED);
    GlMatrix.mat4.rotateY(modelMatrix, modelMatrix, ROTATION_SPEED);
    GlMatrix.mat4.rotateZ(modelMatrix, modelMatrix, ROTATION_SPEED);
    gl.uniformMatrix4fv(program.uniformsCache['modelMatrix'], false, modelMatrix);
  },

  _animate() {
    let gl = this.get('gl');

    this.rotate(gl);
    this.draw(gl);
    window.requestAnimationFrame(this.animate);
  },

  draw(gl) {
    this.clearGl(gl);
    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES);
  }
});
