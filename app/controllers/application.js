import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['period', 'scale'],

  cubeAttributes: Ember.computed('period', 'scale', function() {
    let params = this.get('queryParams');
    let paramsHash = params.reduce((hash, attribute) => {
      hash[attribute] = this.get(attribute);
      return hash;
    }, {});

    return paramsHash;
  }),

  controls: Ember.computed(function() {
    return [
      {
        name: 'period',
        displayName: 'Period',
        value: this.get('period') || 0.0004,
        step: 0.0001,
        min: 0.0001,
        max: 0.0009
      },
      {
        name: 'scale',
        displayName: 'Scale',
        value: this.get('scale') || 1.0,
        step: 0.1,
        min:0.1,
        max: 3.0
      }
    ]
  }),

  actions: {
    updateGrabBag(name, event) {
      let value = event.target.value;
      this.set(name, value);
    }
  }
});
