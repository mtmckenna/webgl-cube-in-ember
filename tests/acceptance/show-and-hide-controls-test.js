import { test } from 'qunit';
import moduleForAcceptance from 'webgl-cube-in-ember/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | show and hide controls');

test('can show and hide controls', function(assert) {
  visit('/');
  assert.equal($('body').text().indexOf('Period'), -1);
  assert.equal($('body').text().indexOf('Scale'), -1);
  click('.controls-toggle');

  andThen(function() {
    assert.equal(currentURL(), '/controls');
    assert.notEqual($('body').text().indexOf('Period'), -1);
    assert.notEqual($('body').text().indexOf('Scale'), -1);
    click('.controls-toggle');

    andThen(function() {
      assert.equal(currentURL(), '/');
      assert.equal($('body').text().indexOf('Period'), -1);
      assert.equal($('body').text().indexOf('Scale'), -1);
      click('.controls-toggle');
    });
  });
});
