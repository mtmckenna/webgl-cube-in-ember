import Ember from 'ember';

import GlMatrix from 'npm:gl-matrix';
import shaders from 'webgl-cube-in-ember/ember-stringify';

import {
  programFromCompiledShadersAndUniformNames,
  configureBuffer
} from '../helpers/gl-helpers';

const GRAY = { r: 0.75, g: 0.75, b: 0.75 };
const ROTATION_SPEED = 0.007;
const UNIFORM_NAMES = [
  'modelMatrix',
  'viewMatrix',
  'projectionMatrix'
];
const VERTICES = new Float32Array([
	-1.0, -1.0, -1.0,
	 1.0, -1.0, -1.0,
	-1.0,  1.0, -1.0,
	-1.0,  1.0, -1.0,
	 1.0, -1.0, -1.0,
	 1.0,  1.0, -1.0,

	-1.0, -1.0, 1.0,
	 1.0, -1.0, 1.0,
	-1.0,  1.0, 1.0,
	-1.0,  1.0, 1.0,
	 1.0, -1.0, 1.0,
	 1.0,  1.0, 1.0,

	1.0, -1.0, -1.0,
	1.0, -1.0,  1.0,
	1.0,  1.0, -1.0,
	1.0,  1.0, -1.0,
	1.0, -1.0,  1.0,
	1.0,  1.0,  1.0,

	-1.0, -1.0, -1.0,
	-1.0, -1.0,  1.0,
	-1.0,  1.0, -1.0,
	-1.0,  1.0, -1.0,
	-1.0, -1.0,  1.0,
	-1.0,  1.0,  1.0,

	 1.0, 1.0, -1.0,
	 1.0, 1.0,  1.0,
	-1.0, 1.0, -1.0,
	 1.0, 1.0,  1.0,
	-1.0, 1.0,  1.0,
	-1.0, 1.0, -1.0,

	 1.0, -1.0, -1.0,
	 1.0, -1.0,  1.0,
	-1.0, -1.0, -1.0,
	 1.0, -1.0,  1.0,
	-1.0, -1.0,  1.0,
	-1.0, -1.0, -1.0,
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
    this.animate();
  },

  configureCanvas() {
    let gl = this.get('gl');
    if (gl) {
      this.clearGl(gl);
      this.configureGl(gl);
    }
  },

  clearGl(gl) {
    gl.clearColor(GRAY.r, GRAY.g, GRAY.b, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  },

  configureGl(gl) {
    let program = this.get('program');
    let viewMatrix = this.get('viewMatrix');
    let projectionMatrix = this.get('projectionMatrix');

    gl.useProgram(program);
    gl.uniformMatrix4fv(program.uniformsCache['viewMatrix'], false, viewMatrix);
    gl.uniformMatrix4fv(program.uniformsCache['projectionMatrix'], false, projectionMatrix);
    this.configureVerticesForCube(gl, program, VERTICES);
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
