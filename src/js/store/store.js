import { log } from 'debug';
import PubSub from '../lib/pubsub';

export default class Store {
  constructor({ actions = {}, mutations = {}, initialState = {} }) {
    this.actions = actions;
    this.mutations = mutations;

    this.events = new PubSub();
    this.isDevelopment = process.env.NODE_ENV === 'development';

    const self = this;

    this.state = new Proxy(initialState, {
      set(state, key, value) {
        if (state[key] !== value) {
          state[key] = value;
          self.events.pub('stateChange', key);
        }

        return true;
      },
    });
  }

  dispatch(id, payload) {
    if (typeof this.actions[id] !== 'function') {
      log(`Action "${id}" doesn't exist.`);

      return false;
    }

    if (this.isDevelopment) {
      log(`action: ${id}`);
    }

    this.actions[id](this, payload);

    return true;
  }

  commit(id, payload) {
    if (typeof this.mutations[id] !== 'function') {
      log(`Mutation "${id}" doesn't exist.`);

      return false;
    }

    const newState = this.mutations[id](this.state, payload);

    this.state = Object.assign(this.state, newState);

    return true;
  }

  getState() {
    return this.state;
  }
}
