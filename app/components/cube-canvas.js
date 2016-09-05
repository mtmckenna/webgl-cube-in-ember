import Ember from 'ember';
import GlMatrix from 'npm:gl-matrix';

import shaders from 'webgl-cube-in-ember/ember-stringify';

import {
  VERTICES,
  NUM_VERTICES,
  TEX_COORDS,
  NORMALS
} from './cube-data';

import {
  programFromCompiledShadersAndUniformNames,
  configureBuffer
} from '../helpers/gl-helpers';

const CAMERA_DISTANCE = 4.0;
const NEAR_BOUND = 1.0;
const FAR_BOUND = 100.0;
const FOV = 30.0;
const ROTATION_SPEED = -0.007;
const LIGHT_DIRECTION = [0.0, 0.0, 1.0];
const UNIFORM_NAMES = [
  'modelMatrix',
  'viewMatrix',
  'projectionMatrix',
  'sampler',
  'reverseLightDirection'
];

export default Ember.Component.extend({
  classNames: ['cube-canvas'],
  tagName: 'canvas',
  modelMatrix: GlMatrix.mat4.create(),
  viewMatrix: GlMatrix.mat4.create(),
  projectionMatrix: GlMatrix.mat4.create(),
  aspectRatio: 1.0,
  dragPosition: null,
  mousePosition: { x: 0, y: 0 },

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
      this.addEventListeners();
    });
  },

  willDestroyElement() {
    this.removeEventListeners();
  },

  addEventListeners() {
    this.configureEventListeners();
    let canvas = this.get('element');
    canvas.addEventListener('mousemove', this.mouseMoved, false);
    canvas.addEventListener('mouseup', this.mouseUp, false);
  },

  removeEventListeners() {
    let canvas = this.get('element');
    canvas.removeEventListener('mousemove', this.mouseMoved, false);
    canvas.removeEventListener('mouseup', this.mouseUp, false);
  },

  configureEventListeners() {
    this.set('mouseUp', this._mouseUp.bind(this));
    this.set('mouseMoved', this._mouseMoved.bind(this));
  },

  configureGl(gl) {
    this.configureViewMatrix();
    this.configureProjectionMatrix();

    let program = this.get('program');
    gl.useProgram(program);

    this.configureUniforms(gl, program);
    this.configureVerticesForCube(gl, program, VERTICES);
    this.configureTextureMapForCube(gl, program, TEX_COORDS);
    this.configureNormalsForCube(gl, program, NORMALS);

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
      this.get('aspectRatio'),
      NEAR_BOUND,
      FAR_BOUND
    );
  },

  configureUniforms(gl, program) {
    this.configureLightDirection(gl, program);
    this.updateModelMatrix();
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  },

  configureLightDirection(gl, program) {
    let reverseLightDirection = GlMatrix.vec3.create();
    GlMatrix.vec3.normalize(reverseLightDirection, LIGHT_DIRECTION);
    gl.uniform3fv(program.uniformsCache['reverseLightDirection'], reverseLightDirection);
  },

  configureVerticesForCube(gl, program, vertices) {
    configureBuffer(gl, program, vertices, 3, 'position');
  },

  configureTextureMapForCube(gl, program, textureCoordinates) {
    configureBuffer(gl, program, textureCoordinates, 2, 'texCoord');
  },

  configureNormalsForCube(gl, program, normals) {
    configureBuffer(gl, program, normals, 3, 'normal');
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

  rotate() {
    let modelMatrix = this.get('modelMatrix');
    GlMatrix.mat4.rotateX(modelMatrix, modelMatrix, ROTATION_SPEED);
    GlMatrix.mat4.rotateY(modelMatrix, modelMatrix, ROTATION_SPEED);
    GlMatrix.mat4.rotateZ(modelMatrix, modelMatrix, ROTATION_SPEED);
    this.updateModelMatrix();
  },

  _animate() {
    let gl = this.get('gl');
    if (!gl) { return; }

    this.rotate(gl);
    this.draw(gl);
    window.requestAnimationFrame(this.animate);
  },

  draw(gl) {
    this.resizeCanvas(gl);
    this.clearGl(gl);
    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES);
  },

  resizeCanvas(gl) {
    let canvas = gl.canvas;

    if (canvas.clientWidth === canvas.width &&
        canvas.clientHeight === canvas.height) {
      return;
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    this.set('aspectRatio', canvas.width / canvas.height);

    gl.viewport(0, 0, canvas.width, canvas.height);
    this.updateProjectionMatrix();
  },

  updateModelMatrix() {
    let gl = this.get('gl');
    let program = this.get('program');
    let modelMatrix = this.get('modelMatrix');
    gl.uniformMatrix4fv(program.uniformsCache['modelMatrix'], false, modelMatrix);
  },

  updateViewMatrix() {
    let gl = this.get('gl');
    let program = this.get('program');
    let viewMatrix = this.get('viewMatrix');
    gl.uniformMatrix4fv(program.uniformsCache['viewMatrix'], false, viewMatrix);
  },

  updateProjectionMatrix() {
    let gl = this.get('gl');
    let projectionMatrix = this.get('projectionMatrix');
    let program = this.get('program');

    this.configureProjectionMatrix();
    gl.uniformMatrix4fv(program.uniformsCache['projectionMatrix'], false, projectionMatrix);

  },

  rotateView(x, y) {
    let viewMatrix = this.get('viewMatrix');
    GlMatrix.mat4.rotateX(viewMatrix, viewMatrix, y);
    GlMatrix.mat4.rotateY(viewMatrix, viewMatrix, -x);
  },

  normalizedCoordinates(event) {
    return {
      x: event.clientX / window.innerWidth,
      y: 1 - event.clientY / window.innerHeight
    };
  },

  coordinatesToRotateByFromEvent(event) {
    let dragPosition = this.get('dragPosition');
    if (!dragPosition) { dragPosition = this.normalizedCoordinates(event); }
    let newPosition = this.normalizedCoordinates(event);
    let x = newPosition.x - dragPosition.x;
    let y = newPosition.y - dragPosition.y;
    this.set('dragPosition', newPosition);
    return {x: x, y: y};
  },

  _mouseMoved(event) {
    this.set('mousePosition', this.normalizedCoordinates(event));
    this.handleUserRotation(event);
  },

  _mouseUp() {
    this.set('dragPosition', null);
  },

  handleUserRotation(event) {
    let shouldRotate = !!event.buttons;
    if (!shouldRotate) { return; }

    let { x, y } = this.coordinatesToRotateByFromEvent(event);
    this.rotateView(x, y);
    this.updateViewMatrix();
  }
});
