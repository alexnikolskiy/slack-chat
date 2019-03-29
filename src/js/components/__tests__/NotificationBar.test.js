import NotificationBar from '../NotificationBar';
import PubSub, { mockPub, mockSub } from '../../lib/pubsub';
import io, { mockOn, mockEmit } from '../../lib/io';
import generate from '../../../../utils/generate';
import { mockGetState } from '../../store/store';

jest.mock('../../lib/pubsub');
jest.mock('../../lib/io');
jest.mock('../../store/store');

let socket;
let pubsub;
let notificationBar;

beforeAll(() => {
  socket = io();
  pubsub = new PubSub();
});

beforeEach(() => {
  document.body.innerHTML = '<div class="notification-bar"></div>';
  notificationBar = new NotificationBar(socket, pubsub);
  mockPub.mockClear();
  mockSub.mockClear();
  mockOn.mockClear();
  mockEmit.mockClear();
});

test('`elem` property should be defined during `NotificationBar` class instantiation', () => {
  expect(notificationBar.elem).toBeDefined();
});

test('should return typing text', () => {
  let users = [];
  let text;

  // no users
  text = NotificationBar.getTypingText(users);
  expect(text).toHaveLength(0);

  // 1 user
  const user = generate.userData();
  users.push(user.username);
  text = NotificationBar.getTypingText(users);
  expect(text).toMatch(`${user.username}`);

  // 2 users
  const user1 = generate.userData();
  const user2 = generate.userData();
  users = [];
  users.push(user1.username, user2.username);
  text = NotificationBar.getTypingText(users);
  expect(text).toMatch(`${user1.username}`);
  expect(text).toMatch(`${user2.username}`);

  // 3 users
  users.push(user);
  text = NotificationBar.getTypingText(users);
  expect(text).toMatch('Several people are typing');
});

test('should show typing text on socket.io `message:typing` event', () => {
  const user = generate.userData();
  const users = [user.username];
  const sender = generate.userData();

  mockGetState.mockReturnValue({ sender, receiver: null });
  notificationBar.ioMessageTyping(users, false);
  expect(notificationBar.state.text).toMatch(user.username);
});

test('should not show typing text', () => {
  const user = generate.userData();
  const users = [user.username];
  const sender = generate.userData();
  const receiver = generate.userData();

  // if private chatting but not private message
  mockGetState.mockReturnValue({ sender, receiver });
  notificationBar.ioMessageTyping(users, false);
  expect(notificationBar.state.text).toHaveLength(0);

  // if private messages but not private chatting
  mockGetState.mockReturnValue({ sender, receiver: null });
  notificationBar.ioMessageTyping(users, true);
  expect(notificationBar.state.text).toHaveLength(0);

  // if private message and private chatting but chatting with yourself
  mockGetState.mockReturnValue({ sender, receiver: sender });
  notificationBar.ioMessageTyping(users, true);
  expect(notificationBar.state.text).toHaveLength(0);
});

test('should render', () => {
  notificationBar.state.text = generate.title();
  notificationBar.render();
  expect(notificationBar.elem.innerHTML).not.toHaveLength(0);
});
