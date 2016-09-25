import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('attribute-controls', 'Integration | Component | attribute controls', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.set('updateAttribute', () => assert.ok(true));

  this.render(hbs`{{attribute-controls updateAttribute=(action updateAttribute)}}`);

  assert.equal(this.$().text().trim(), '');
});
