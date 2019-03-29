import ChatHeader from '../ChatHeader';
import PubSub, { mockPub, mockSub } from '../../lib/pubsub';
import io, { mockOn, mockEmit } from '../../lib/io';
import { mockGetState } from '../../store/store';
import generate from '../../../../utils/generate';

jest.mock('../../lib/pubsub');
jest.mock('../../lib/io');
jest.mock('../../store/store');

let pubsub;
let socket;
let chatHeader;

beforeAll(() => {
  socket = io();
  pubsub = new PubSub();
});

beforeEach(() => {
  document.body.innerHTML = '<header class="chat-box__header"></header>';
  chatHeader = new ChatHeader(socket, pubsub);
  mockPub.mockClear();
  mockSub.mockClear();
  mockOn.mockClear();
  mockEmit.mockClear();
  // chatHeader.elem.innerHTML = '';
});

test('`elem` property should be defined during `ChatHeader` class instantiation', () => {
  expect(chatHeader.elem).toBeDefined();
});

describe('getTitle', () => {
  test('should return title', () => {
    const sender = generate.userData();
    const receiver = generate.userData();
    const room = generate.roomData();
    let title;

    // if not private chatting
    mockGetState.mockReturnValue({ sender });
    title = chatHeader.getTitle(room);
    expect(title).toBe(`# ${room.name}`);

    // if private chatting
    mockGetState.mockReturnValue({ sender, receiver });
    title = chatHeader.getTitle(receiver);
    expect(title).toBe(receiver.username);

    // if private chatting with yourself
    mockGetState.mockReturnValue({ sender, receiver: sender });
    title = chatHeader.getTitle(sender);
    expect(title).toEqual(expect.stringContaining(sender.username));
    expect(title).toEqual(expect.stringContaining('you'));
  });

  test('should return current title if no data passed', () => {
    const testTitle = generate.title();
    chatHeader.state.title = testTitle;

    const title = chatHeader.getTitle();
    expect(title).toBe(testTitle);
  });
});

describe('getInfo', () => {
  test('should return info', () => {
    const member = generate.userData({ online: true });
    let info;

    // if data is an array of members
    info = chatHeader.getInfo(new Array(3));
    expect(info).toBe('3 members');

    // if data is a member and private chatting
    mockGetState.mockReturnValue({ receiver: generate.userData() });
    info = chatHeader.getInfo(member);
    expect(info).toBe('online');

    // if data is a member and not private chatting
    const testInfo = generate.title();
    chatHeader.state.info = testInfo;
    mockGetState.mockReturnValue({ receiver: null });
    info = chatHeader.getInfo(member);
    expect(info).toBe(testInfo);
  });

  test('should return current info if no data passed', () => {
    const testInfo = generate.title();
    chatHeader.state.info = testInfo;

    const info = chatHeader.getInfo();
    expect(info).toBe(testInfo);
  });
});

test('should change state on pubsub `member:join` event', () => {
  const getInfo = jest.spyOn(chatHeader, 'getInfo');
  const members = new Array(3);
  const info = `${members.length} members`;

  getInfo.mockReturnValue(info);
  chatHeader.handleMemberJoin(members);
  expect(chatHeader.state.info).toBe(info);
  getInfo.mockRestore();
});

test('should change state on pubsub `room:leave` event', () => {
  const getInfo = jest.spyOn(chatHeader, 'getInfo');
  const members = new Array(3);
  const info = `${members.length} members`;

  getInfo.mockReturnValue(info);
  chatHeader.handleLeaveRoom(members);
  expect(chatHeader.state.info).toBe(info);
  getInfo.mockRestore();
});

test('should change state on pubsub `room:select` event', () => {
  const getTitle = jest.spyOn(chatHeader, 'getTitle');
  const room = generate.roomData();

  getTitle.mockReturnValue(room.name);
  chatHeader.handleSelectRoom(room);
  expect(chatHeader.state).toMatchObject({ title: room.name, info: '', isMember: false });
  getTitle.mockRestore();
});

test('should change state on pubsub `member:select` event', () => {
  const getTitle = jest.spyOn(chatHeader, 'getTitle');
  const getInfo = jest.spyOn(chatHeader, 'getInfo');
  const member = generate.userData({ online: true });

  getTitle.mockReturnValue(member.username);
  getInfo.mockReturnValue('online');
  chatHeader.handleMemberSelect(member);
  expect(chatHeader.state).toMatchObject({
    title: member.username,
    info: 'online',
    online: true,
    isMember: true,
  });
  getTitle.mockRestore();
  getInfo.mockRestore();
});

test('should change state on socket.io `online` event', () => {
  const getInfo = jest.spyOn(chatHeader, 'getInfo');
  const member = generate.userData({ online: true });

  getInfo.mockReturnValue('online');
  chatHeader.ioChangeStatus(member);
  expect(chatHeader.state).toMatchObject({ info: 'online', online: member.online });
  getInfo.mockRestore();
});

test('should render', () => {
  chatHeader.render();
  expect(chatHeader.elem.innerHTML).not.toHaveLength(0);
});
