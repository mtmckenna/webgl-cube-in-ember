import { atHome } from 'webgl-cube-in-ember/helpers/at-home';
import { module, test } from 'qunit';

module('Unit | Helper | at home');

// Replace this with your real tests.
test('false when not at home', function(assert) {
  let result = atHome(['controls']);
  assert.notOk(result);
});

test('true when at home', function(assert) {
  let result = atHome(['index']);
  assert.ok(result);
});
