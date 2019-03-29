import RoomList from '../RoomList';
import * as roomService from '../../services/room';
import PubSub, { mockPub } from '../../lib/pubsub';
import io, { mockOn, mockEmit } from '../../lib/io';
import generate from '../../../../utils/generate';
import { mockGetState, mockDispatch } from '../../store/store';

jest.mock('../../lib/pubsub');
jest.mock('../../lib/io');
jest.mock('../../store/store');

let pubsub;
let socket;
let roomList;

const rooms = Array.from({ length: 3 }, () => generate.roomData({ id: generate.id() }));
roomService.getRooms = jest.fn().mockResolvedValue(rooms);

describe('RoomList', () => {
  beforeAll(() => {
    pubsub = new PubSub();
    socket = io();
  });

  beforeEach(() => {
    document.body.innerHTML = '<ul class="chat-sidebar__rooms"></ul>';
    roomList = new RoomList(socket, pubsub);
    mockPub.mockClear();
    mockOn.mockClear();
    mockEmit.mockClear();
  });

  afterEach(() => {
    PubSub.mockClear();
    // cleanIO();
    // roomList.elem.innerHTML = '';
  });

  test('`elem` property should be defined during `RoomList` class instantiation', () => {
    expect(roomList.elem).toBeDefined();
  });

  test('should select room', () => {
    const room = rooms[0];

    roomList.state.rooms = rooms;
    roomList.selectRoom(room.id);

    expect(mockEmit).toHaveBeenCalledWith('room:join', room.id);
    expect(roomList.state).toMatchObject({
      joined: room.id,
      selected: room.id,
      lastVisit: expect.any(Number),
    });
    expect(roomList.state.rooms).toContainEqual({ ...room, newMessages: 0 });
    expect(mockDispatch).toHaveBeenCalledWith('selectRoom');
    expect(mockPub).toHaveBeenCalledWith('room:select', room, expect.any(Number));
  });

  test('should not select the same room', () => {
    const roomId = rooms[0].id;

    roomList.selected = roomId;
    roomList.selectRoom(roomId);

    expect(mockPub).not.toHaveBeenCalled();
  });

  test('should not select not exist room', () => {
    roomList.selectRoom(generate.id());
    expect(mockPub).not.toHaveBeenCalled();
  });

  test('should not emit `room:join` socket.io event if user select current room ', () => {
    const roomId = rooms[0].id;

    roomList.state.rooms = rooms;
    roomList.state.joined = roomId;
    roomList.selectRoom(roomId);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  test('should load rooms on pubsub `login` event', async () => {
    const sender = generate.userData({ room: generate.roomData({ id: generate.id() }) });

    mockGetState.mockImplementation(() => ({ sender }));
    await roomList.handleLogin();

    expect(roomList.state.rooms).toHaveLength(rooms.length);
    expect(roomList.state.rooms).toMatchObject(rooms);
    expect(roomList.state.joined).toBe(sender.room.id);
  });

  test('should unselect room on member select', () => {
    roomList.handleSelectMember();
    expect(roomList.state.selected).toBeNull();
    expect(roomList.state.lastVisit).toEqual(expect.any(Number));
  });

  test('should increment new messages count on new message', () => {
    const room = rooms[0];
    const sender = generate.userData({ room });
    const receiver = generate.userData({ room });
    const message = generate.messageData({ room, receiver: null });

    mockGetState.mockReturnValue({ sender, receiver });
    roomList.state.rooms = [{ ...room, newMessages: 0 }, ...rooms.slice(1)];
    roomList.ioAddMessage(message);

    expect(roomList.state.rooms).toContainEqual({ ...room, newMessages: 1 });
  });

  test('should ignore notifying about new messages in another room', () => {
    const sender = generate.userData({ room: generate.roomData({ id: generate.id() }) });
    const message = generate.messageData({
      room: generate.roomData({ id: generate.id() }),
      receiver: null,
    });

    mockGetState.mockReturnValue({ sender, receiver: null });
    roomList.state.rooms = rooms;
    roomList.ioAddMessage(message);
    expect(roomList.state.rooms).toEqual(rooms);
  });

  test('should not notify about new messages in the room if it is a private message or you are not private chatting', () => {
    const room = rooms[0];
    const sender = generate.userData({ room });
    const message = generate.messageData({ room, receiver: null });

    roomList.state.rooms = rooms;

    mockGetState.mockReturnValue({ sender, receiver: null });
    roomList.ioAddMessage(message);
    expect(roomList.state.rooms).toEqual(rooms);

    mockGetState.mockReturnValue({ sender, receiver: sender });
    message.receiver = sender;
    expect(roomList.state.rooms).toEqual(rooms);
  });

  test('should render', () => {
    roomList.state.rooms = rooms;
    roomList.render();
    expect(roomList.elem.innerHTML).not.toHaveLength(0);
  });
});
