import Store from '../store/store';

export default class Component {
  constructor({ store, elem, observedAttrs = [] }) {
    this.render = this.render || function render() {};
    this.state = {};

    if (store instanceof Store) {
      store.events.sub('stateChange', attr => {
        if (observedAttrs.includes(attr)) {
          this.render();
        }
      });
    }

    if (elem) {
      this.elem = elem;
    }
  }

  setState(state) {
    this.state = { ...this.state, ...state };
    this.render();
  }
}
