import Store from './store';
import actions from './actions';
import mutations from './mutations';

const initialState = {
  sender: null,
  receiver: null,
};

const store = new Store({
  actions,
  mutations,
  initialState,
});

if (process.env.NODE_ENV === 'development') {
  window.store = store;
}

export default store;
