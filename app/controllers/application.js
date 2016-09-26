import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['period', 'scale'],

  attributesHash: Ember.computed(function() {
    let params = this.get('queryParams');
    let paramsHash = params.reduce((hash, attribute) => {
      hash[attribute] = this.get(attribute);
      return hash;
    }, {});

    return paramsHash;
  }).volatile(),

  actions: {
    updateAttribute(name, event) {
      let value = event.target.value;
      this.set(name, value);
      this.set('attributes', this.get('attributesHash'));
    }
  }
});
