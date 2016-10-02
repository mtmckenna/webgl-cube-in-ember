import Ember from 'ember';
import QueryParamsHash from 'ember-query-params-hash/mixins/query-params-hash';

export default Ember.Controller.extend(QueryParamsHash, {
  queryParams: ['period', 'scale'],

  controls: Ember.computed(function() {
    return [
      {
        name: 'period',
        displayName: 'Period',
        value: this.get('period') || 0.0009,
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
    ];
  }),

  actions: {
    updateGrabBag(name, event) {
      let value = event.target.value;
      this.set(name, value);
      this.notifyPropertyChange('queryParamsHash');
    }
  }
});
