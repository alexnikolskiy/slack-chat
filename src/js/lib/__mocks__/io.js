export const mockOn = jest.fn();
export const mockEmit = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    on: mockOn,
    emit: mockEmit,
  };
});

export default mock;

/*
import Pubsub from '../pubsub';

jest.unmock('../pubsub');

const clientEvents = new Pubsub();
const serverEvents = new Pubsub();

const client = {
  on(event, fn) {
    clientEvents.sub(event, fn);
  },
  emit(event, ...args) {
    serverEvents.pub(event, ...args);
  },
};

export const server = {
  on(event, fn) {
    serverEvents.sub(event, fn);
  },
  emit(event, ...args) {
    clientEvents.pub(event, ...args);
  },
};

export const clean = () => {
  clientEvents.purge();
  serverEvents.purge();
};

export default client;
*/
