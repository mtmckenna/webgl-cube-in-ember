import Ember from 'ember';

export default Ember.Controller.extend({
  appController: Ember.inject.controller('application'),
  actions: {
    updateGrabBag: function(name, event) {
      this.get('appController').send('updateGrabBag', name, event);
    }
  }
});
