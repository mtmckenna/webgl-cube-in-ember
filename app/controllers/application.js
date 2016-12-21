import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['scale'],

  actions: {
    updateScale(event) {
      this.set('scale', event.target.value);
    }
  }
});
