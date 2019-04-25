export default {
  login(store, payload) {
    store.commit('login', payload);
  },
  editUser(store, payload) {
    store.commit('editUser', payload);
  },
  selectMember(store, payload) {
    store.commit('selectMember', payload);
  },
  selectRoom(store) {
    store.commit('selectRoom');
  },
};
