import io from 'socket.io-client';
import http from 'http';
import ioBack from 'socket.io';
import User from '../components/User';
import { socket as socketConfig } from '../../../config';

let socket;
let httpServer;
let ioServer;

const body = `
  <div class="chat-page__container">
    <aside class="chat-sidebar">
      <div class="chat-sidebar__user"></div>
    </aside>
  </div>
`;
document.body.innerHTML = body;
const user = new User();

describe('User', () => {
  beforeAll(done => {
    httpServer = http.createServer().listen(3000);
    ioServer = ioBack(httpServer);
    done();
  });

  afterAll(done => {
    httpServer.close();
    ioServer.close(done);
  });

  beforeEach(done => {
    document.body.innerHTML = body;

    socket = io.connect(socketConfig.url, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      done();
    });
  });

  afterEach(done => {
    if (socket.connected) {
      socket.disconnect();
    }

    done();
  });

  test('`elem` property should be defined during `User` class instantiation', () => {
    expect(user.elem).toBeDefined();
  });

  test('displays a menu after click on user', () => {
    user.elem.dispatchEvent(new Event('click'));
    const menu = document.querySelector('.menu');

    expect(menu).not.toBeNull();
    expect(menu.style.opacity).toBe('1');
  });

  test('should set `user` property and render component on socket.io `login` event', done => {
    const userData = { username: 'SdP' };

    ioServer.emit('login', userData);

    setTimeout(() => {
      expect(user.user).toEqual(userData);
      expect(user.elem.innerHTML.length).not.toBe(0);
      done();
    }, 50);
  });

  test('`user` property should be null and should redirect to login page on socket.io `logout` event', done => {
    window.location.assign = jest.fn();

    ioServer.emit('logout');

    setTimeout(() => {
      expect(user.user).toBeNull();
      expect(window.location.assign).toBeCalledWith(`auth/login`);
      done();
    }, 50);
  });

  test('should render component', () => {
    const originUser = user.user;
    user.user = { username: 'SdP' };
    user.render();
    expect(user.elem.innerHTML.length).not.toBe(0);
    user.user = originUser;
  });
});
