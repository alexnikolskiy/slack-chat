export default {
  login(state, payload) {
    return {
      ...state,
      sender: payload,
    };
  },
  editUser(state, payload) {
    return {
      ...state,
      sender: { ...state.sender, ...payload },
    };
  },
  selectMember(state, payload) {
    return {
      ...state,
      receiver: payload,
    };
  },
  selectRoom(state) {
    return {
      ...state,
      receiver: null,
    };
  },
};
