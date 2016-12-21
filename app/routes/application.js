import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(controller) {
    if (!controller.get('scale')) {
      controller.set('scale', 1.0);
    }
  }
});
