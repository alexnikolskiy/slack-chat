import { socket } from '../../../config';

const io = window.io(`${socket.url}`, socket.options);

if (process.env.NODE_ENV === 'development') {
  window.localStorage.debug = 'socket.io-client:socket';
}

export default io;
