import MemberList from '../MemberList';
import PubSub, { mockPub, mockSub } from '../../lib/pubsub';
import io, { mockOn, mockEmit } from '../../lib/io';
import generate from '../../../../utils/generate';
import { mockGetState, mockDispatch } from '../../store/store';
import * as roomService from '../../services/room';

jest.mock('../../lib/pubsub');
jest.mock('../../lib/io');
jest.mock('../../store/store');

let socket;
let pubsub;
let memberList;

const members = Array.from({ length: 5 }, () => generate.userData({ id: generate.id() }));
roomService.getRoomMembers = jest.fn().mockResolvedValue(members);

beforeAll(() => {
  socket = io();
  pubsub = new PubSub();
});

beforeEach(() => {
  document.body.innerHTML = '<ul class="chat-sidebar__members"></ul>';
  memberList = new MemberList(socket, pubsub);
  mockPub.mockClear();
  mockSub.mockClear();
  mockOn.mockClear();
  mockEmit.mockClear();
  // memberList.elem.innerHTML = '';
});

test('`elem` property should be defined during `MemberList` class instantiation', () => {
  expect(memberList.elem).toBeDefined();
});

test('should select member', () => {
  const member = members[0];

  memberList.state.members = members;
  memberList.selectMember(member.id);

  expect(mockPub).toHaveBeenCalledWith('member:select', member);
  expect(memberList.state.members).toContainEqual({
    ...member,
    newMessages: 0,
    lastVisit: expect.any(Number),
  });
  expect(memberList.state.selected).toBe(member.id);
  expect(mockDispatch).toHaveBeenCalledWith('selectMember', member);
});

test('should select member on pubsub event `message:select-user`', () => {
  const member = members[0];
  const spy = jest.spyOn(memberList, 'selectMember');

  memberList.state.members = members;
  memberList.handleSelectUser(member.username);
  expect(spy).toHaveBeenCalledWith(member.id);
  spy.mockRestore();
});

test('should not select not exist member on pubsub event `message:select-user`', () => {
  const member = generate.userData();
  const spy = jest.spyOn(memberList, 'selectMember');

  memberList.state.members = members;
  memberList.handleSelectUser(member.username);
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

test('should load rooms on select room', async () => {
  const room = generate.roomData({ id: generate.id() });
  const member = members[0];

  mockGetState.mockReturnValue({ sender: member });
  memberList.state.members = members;
  await memberList.handleSelectRoom(room);

  expect(memberList.state.members).toContainEqual({
    ...member,
    isLoggedUser: true,
    newMessages: 0,
    lastVisit: expect.any(Number),
  });
  expect(memberList.state.selected).toBeNull();
  expect(mockPub).toHaveBeenCalledWith('member:join', memberList.state.members);
});

test('should increment new messages counter on new message', () => {
  const member = members[0];

  memberList.state.members = [{ ...member, newMessages: 0 }, members.slice(1)];
  memberList.handleNewMessage(member.username);

  expect(memberList.state.members).toContainEqual({ ...member, newMessages: 1 });
});

test('should add member on socket.io `room:join` event', () => {
  const user = generate.userData({ id: generate.id() });

  memberList.state.members = members;
  memberList.ioJoinRoom({ user });
  expect(memberList.state.members).toContainEqual({
    ...user,
    isLoggedUser: false,
    lastVisit: expect.any(Number),
  });
  expect(mockPub).toHaveBeenCalledWith('member:join', memberList.state.members);
});

test('should not add exist member', () => {
  const user = members[0];

  memberList.state.members = members;
  memberList.ioJoinRoom({ user });
  expect(memberList.state.members).toEqual(members);
});

test('should remove member on socket.io `room:leave` event', () => {
  const user = members[0];

  memberList.state.members = members;
  memberList.ioLeaveRoom({ user });
  expect(memberList.state.members).not.toContainEqual(user);
  expect(mockPub).toHaveBeenCalledWith('room:leave', memberList.state.members);
});

test('should change online status', () => {
  const user = { ...members[0], online: true };

  memberList.state.members = [{ ...members[0], online: false }, ...members.slice(1)];
  memberList.ioChangeStatus(user);
  expect(memberList.state.members).toContainEqual(user);
});

test('should notify about new private message', () => {
  const room = generate.roomData({ id: generate.id() });
  const sender = generate.userData({ room });
  const message = generate.messageData({
    room,
    sender: generate.userData(),
    receiver: sender,
  });
  const spy = jest.spyOn(memberList, 'handleNewMessage');
  let receiver = null;

  // if not private chatting but new private message received
  mockGetState.mockReturnValue({ sender, receiver });
  memberList.ioAddMessage(message);
  expect(spy).toHaveBeenCalledWith(message.sender.username);
  spy.mockClear();

  // if private chatting with one member and private message from another one
  receiver = generate.userData();
  mockGetState.mockReturnValue({ sender, receiver });
  memberList.ioAddMessage(message);
  expect(spy).toHaveBeenCalledWith(message.sender.username);
  spy.mockRestore();
});

test('should not notify about new private message if it is sent from another room', () => {
  const sender = generate.userData({ room: generate.roomData({ id: generate.id() }) });
  const message = generate.messageData({ room: generate.roomData({ id: generate.id() }) });
  const spy = jest.spyOn(memberList, 'handleNewMessage');

  mockGetState.mockReturnValue({ sender, receiver: null });
  memberList.ioAddMessage(message);
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

test('should not notify about new not private message', () => {
  const room = generate.roomData({ id: generate.id() });
  const sender = generate.userData({ room });
  const message = generate.messageData({
    room,
    sender: generate.userData(),
    receiver: null,
  });
  const spy = jest.spyOn(memberList, 'handleNewMessage');

  mockGetState.mockReturnValue({ sender, receiver: null });
  memberList.ioAddMessage(message);
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

test('should render', () => {
  memberList.state.members = members;
  memberList.render();
  expect(memberList.elem.innerHTML).not.toHaveLength(0);
});
