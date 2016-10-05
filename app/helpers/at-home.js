import Ember from 'ember';

export function atHome(currentRouteName) {
  return currentRouteName.join('.') === 'index';
}

export default Ember.Helper.helper(atHome);
