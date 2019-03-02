import io from 'socket.io-client';
import { socket } from '../../../config';

if (process.env.NODE_ENV === 'development') {
  window.localStorage.debug = 'socket.io-client:socket';
}

export default io(`${socket.url}`, socket.options);
