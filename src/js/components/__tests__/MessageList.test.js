import MessageList from '../MessageList';
import Message, {
  mockRender as mockMessageRender,
  mockRenderActions as mockMessageRenderActions,
} from '../message';
import PubSub, { mockPub, mockSub } from '../../lib/pubsub';
import io, { mockOn, mockEmit } from '../../lib/io';
import generate from '../../../../utils/generate';
import { mockGetState } from '../../store/store';
import * as roomService from '../../services/room';

jest.mock('../../lib/pubsub');
jest.mock('../../lib/io');
jest.mock('../../store/store');
jest.mock('../message');

Date.now = jest.fn(() => 1482363367071);

let socket;
let pubsub;
let messageList;

const room = generate.roomData({ id: generate.id() });
const sender = generate.userData({ id: generate.id() });
const receiver = generate.userData({ id: generate.id });
const roomMessages = Array.from(
  { length: 5 },
  () =>
    new Message(
      generate.messageData({
        id: generate.id(),
        sender: generate.userData(),
        timestamp: Date.now(),
        room,
      }),
    ),
);
const privateMessages = Array.from(
  { length: 3 },
  () =>
    new Message(
      generate.messageData({
        id: generate.id(),
        timestamp: Date.now(),
        sender,
        receiver,
        room,
      }),
    ),
);
const afterMessageRenderProps = {
  elem: expect.any(HTMLElement),
  pubsub: expect.any(Object),
  rendered: true,
  read: true,
  timestamp: expect.any(Number),
};

roomService.getRoomMessages = jest.fn().mockResolvedValue(roomMessages);
roomService.getPrivateMessages = jest.fn().mockResolvedValue(privateMessages);

beforeAll(() => {
  socket = io();
  pubsub = new PubSub();

  window.MutationObserver = jest.fn().mockImplementation(() => {
    return {
      observe: jest.fn(),
    };
  });
});

beforeEach(() => {
  document.body.innerHTML = '<ul class="chat-box__body-list"></ul>';
  messageList = new MessageList(socket, pubsub);
  mockPub.mockClear();
  mockSub.mockClear();
  mockOn.mockClear();
  mockEmit.mockClear();
  mockMessageRender.mockClear();
  mockMessageRenderActions.mockClear();
});

test('`elem` property should be defined during `MemberList` class instantiation', () => {
  expect(messageList.elem).toBeDefined();
});

describe('handleMessageMouseOver', () => {
  test('should render message actions on mouse over', () => {
    const elem = document.createElement('li');
    const event = new Event('mouseover');
    const message = roomMessages[0];

    elem.className = 'message';
    elem.dataset.id = message.id;
    messageList.state.messages = roomMessages;
    mockGetState.mockReturnValue({ sender: message.sender });
    message.automated = false;

    elem.addEventListener('mouseover', messageList.handleMessageMouseOver);
    elem.dispatchEvent(event);

    expect(mockMessageRenderActions).toHaveBeenCalledWith({
      isOwnMessage: true,
      isAutomated: false,
    });
    expect(elem.querySelector('.message__action-list')).not.toBeNull();
  });

  test('should not render message actions on mouse over if message elem not found or message is editing', () => {
    const elem = document.createElement('li');
    const event = new Event('mouseover');

    elem.addEventListener('mouseover', messageList.handleMessageMouseOver);
    elem.dispatchEvent(event);
    expect(mockMessageRenderActions).not.toHaveBeenCalled();

    elem.className = 'message message_editing';
    expect(mockMessageRenderActions).not.toHaveBeenCalled();
  });

  test('should not render message actions on mouse over if message not found', () => {
    const elem = document.createElement('li');
    const event = new Event('mouseover');

    elem.className = 'message';
    elem.dataset.id = generate.id();
    messageList.state.messages = roomMessages;

    elem.addEventListener('mouseover', messageList.handleMessageMouseOver);
    elem.dispatchEvent(event);
    expect(mockMessageRenderActions).not.toHaveBeenCalled();
  });

  test('should not render message actions on mouse over if they have already been rendered or message element does not have id data attribute', () => {
    const elem = document.createElement('li');
    const event = new Event('mouseover');
    const actionsElem = document.createElement('div');

    elem.className = 'message';
    actionsElem.className = 'message__action-list';
    elem.appendChild(actionsElem);

    elem.addEventListener('mouseover', messageList.handleMessageMouseOver);
    elem.dispatchEvent(event);
    expect(mockMessageRenderActions).not.toHaveBeenCalled();

    elem.removeChild(actionsElem);
    elem.dataset.id = generate.id();

    elem.dispatchEvent(event);
    expect(mockMessageRenderActions).not.toHaveBeenCalled();
  });
});

describe('handleMessageMouseOut', () => {
  test('should remove message actions on mouse out', () => {
    const elem = document.createElement('li');
    const event = new Event('mouseout');
    const actionsElem = document.createElement('div');

    elem.className = 'message';
    actionsElem.className = 'message__action-list';
    elem.appendChild(actionsElem);
    messageList.elem.appendChild(elem);

    elem.addEventListener('mouseout', messageList.handleMessageMouseOut);
    elem.dispatchEvent(event);
    expect(elem.querySelector('.message__action-list')).toBeNull();
  });

  test('should not remove message actions on mouse out if message elem not found or message is editing', () => {
    const elem = document.createElement('li');
    const event = new Event('mouseout');
    const actionsElem = document.createElement('div');

    actionsElem.className = 'message__action-list';
    elem.appendChild(actionsElem);

    elem.addEventListener('mouseout', messageList.handleMessageMouseOut);
    elem.dispatchEvent(event);
    expect(elem.querySelector('.message__action-list')).not.toBeNull();

    elem.className = 'message message_editing';
    expect(elem.querySelector('.message__action-list')).not.toBeNull();
  });
});

test('should add new message on socket.io `room:join` or `room:leave` event', () => {
  const message = generate.messageData({ id: generate.id() });
  const user = generate.userData();

  messageList.state.messages = roomMessages;
  messageList.ioJoinOrLeaveRoom({ message, user });

  expect(messageList.state.messages).toHaveLength(roomMessages.length + 1);
  expect(messageList.state.messages).toContainEqual(
    new Message({
      id: message.id,
      sender: user,
      text: message.text,
      automated: true,
      ...afterMessageRenderProps,
    }),
  );
});

describe('ioAddMessage', () => {
  let user;
  let messageSender;
  let messageReceiver;

  beforeAll(() => {
    user = generate.userData();
    messageSender = generate.userData();
    messageReceiver = generate.userData();
  });

  test('should add message', () => {
    const message = generate.messageData({ id: generate.id(), sender: messageSender });

    mockGetState.mockReturnValue({ sender: user, receiver: null });
    messageList.state.messages = roomMessages;
    messageList.ioAddMessage(message);
    expect(messageList.state.messages).toHaveLength(roomMessages.length + 1);
    expect(messageList.state.messages).toContainEqual(
      new Message({ ...message, ...afterMessageRenderProps }),
    );
  });

  test('should not add message', () => {
    const message = generate.messageData({
      id: generate.id(),
      sender: messageSender,
    });

    // if private message, but we in the room
    mockGetState.mockReturnValue({ sender: user, receiver: null });
    messageList.state.messages = roomMessages;
    message.receiver = messageReceiver;
    messageList.ioAddMessage(message);
    expect(messageList.state.messages).toHaveLength(roomMessages.length);

    // if not private message but private chatting
    mockGetState.mockReturnValue({ sender: user, receiver: messageReceiver });
    messageList.state.messages = roomMessages;
    message.receiver = null;
    messageList.ioAddMessage(message);
    expect(messageList.state.messages).toHaveLength(roomMessages.length);

    // if private message from one user, but we are chatting with another one (not with yourself)
    mockGetState.mockReturnValue({ sender: user, receiver: messageReceiver });
    messageList.state.messages = roomMessages;
    message.receiver = null;
    messageList.ioAddMessage(message);
    expect(messageList.state.messages).toHaveLength(roomMessages.length);
  });
});

test('should mark message as edited on socket `message:edit` event', () => {
  const message = roomMessages[0];

  message.text = `${generate.title()} (edited)`;
  messageList.state.messages = roomMessages;
  messageList.ioEditMessage(message);
  expect(messageList.state.messages).toContainEqual(
    new Message({ ...message, edited: true, hasChanges: true, ...afterMessageRenderProps }),
  );
});

describe('ioDeleteMessage', () => {
  test('should delete message on socket.io `message:delete` event', () => {
    const message = roomMessages[0];
    const { deleteMessage } = messageList;

    messageList.state.messages = roomMessages;
    messageList.deleteMessage = jest.fn();
    messageList.ioDeleteMessage(message.id);

    expect(messageList.deleteMessage).toHaveBeenCalledWith(message);
    messageList.deleteMessage = deleteMessage;
  });

  test('should not delete message if not found', () => {
    const mockDeleteMessage = jest.spyOn(messageList, 'deleteMessage');

    messageList.state.messages = roomMessages;
    messageList.ioDeleteMessage(generate.id());
    expect(mockDeleteMessage).not.toHaveBeenCalled();
    mockDeleteMessage.mockRestore();
  });
});

test('should re render messages which sender was edited', () => {
  const message = roomMessages[0];

  message.sender.avatar = 'me.jpg';
  messageList.state.messages = roomMessages;
  messageList.ioMemberEdit(sender);

  expect(messageList.state.messages).toContainEqual(
    new Message({ ...message, ...afterMessageRenderProps }),
  );
});

test('should add message on pubsub `message:add` event', () => {
  const message = generate.messageData({ id: generate.id(), sender: generate.userData() });

  messageList.state.messages = roomMessages;
  messageList.handleAddMessage(message);
  expect(messageList.state.messages).toHaveLength(roomMessages.length + 1);
  expect(messageList.state.messages).toContainEqual(
    new Message({ ...message, ...afterMessageRenderProps }),
  );
});

test('should set message', () => {
  const message = roomMessages[0];

  message.text = generate.title();
  messageList.state.messages = roomMessages;
  messageList.setMessage(message);
  expect(messageList.state.messages).toContainEqual(
    new Message({ ...message, ...afterMessageRenderProps }),
  );
});

test('should set message on pubsub `message:edit` event', () => {
  const message = roomMessages[0];
  const mockSetMessage = jest.spyOn(messageList, 'setMessage');

  messageList.handleEditMessage(message);
  expect(mockSetMessage).toHaveBeenCalledWith(message);
  mockSetMessage.mockRestore();
});

test('should set message on pubsub `message:cancel` event', () => {
  const message = roomMessages[0];
  const mockSetMessage = jest.spyOn(messageList, 'setMessage');

  messageList.handleCancelEditMessage(message);
  expect(mockSetMessage).toHaveBeenCalledWith(message);
  mockSetMessage.mockRestore();
});

test('should set message on pubsub `message:save` event', () => {
  const message = roomMessages[0];
  const mockSetMessage = jest.spyOn(messageList, 'setMessage');

  messageList.handleSaveMessage(message);
  expect(mockSetMessage).toHaveBeenCalledWith(message);
  mockSetMessage.mockClear();

  messageList.handleSaveMessage(message, true);
  expect(mockSetMessage).toHaveBeenCalledWith(message);
  expect(mockEmit).toHaveBeenCalledWith('message:edit', message);
  mockSetMessage.mockRestore();
});

test('should edit last message on pubsub `message:edit-last`', () => {
  const message = roomMessages[0];

  mockGetState.mockReturnValue({ sender: message.sender });
  messageList.state.messages = roomMessages;
  messageList.handleEditLastMessage();
  expect(messageList.state.messages).toContainEqual(
    new Message({ ...message, ...afterMessageRenderProps, editing: true, hasChanges: true }),
  );
});

test('should delete message on pubsub `message:delete` event', () => {
  const message = roomMessages[0];
  const { deleteMessage } = messageList;

  messageList.state.messages = roomMessages;
  messageList.deleteMessage = jest.fn();
  messageList.handleDeleteMessage(message);
  expect(messageList.deleteMessage).toHaveBeenCalledWith(message);
  expect(mockEmit).toHaveBeenCalledWith('message:delete', message.id);
  messageList.deleteMessage = deleteMessage;
});

test('should delete message', () => {
  const message = roomMessages[0];
  const elem = document.createElement('li');

  elem.className = 'message';
  message.elem = elem;
  messageList.elem.appendChild(message.elem);
  messageList.state.messages = roomMessages;
  messageList.deleteMessage(message);

  expect(messageList.state.messages).toHaveLength(roomMessages.length - 1);
});

test('should set messages', () => {
  const mockScroll = jest.spyOn(messageList, 'scroll');
  const roomMessagesAfterRender = roomMessages.map(
    message => new Message({ ...message, ...afterMessageRenderProps }),
  );

  messageList.handleLoadMessages(roomMessages);
  expect(messageList.state.messages).toEqual(roomMessagesAfterRender);
  expect(mockScroll).toHaveBeenCalled();
  mockScroll.mockRestore();
});

test('should load room messages on pubsub `room:select` event', async () => {
  const { handleLoadMessages } = messageList;
  const roomId = generate.id();
  const lastVisit = Date.now();
  const loadedMessages = roomMessages.map(message => ({ ...message, read: true }));

  messageList.handleLoadMessages = jest.fn();
  await messageList.handleSelectRoom(roomId, lastVisit);
  expect(messageList.handleLoadMessages).toHaveBeenCalledWith(loadedMessages);
  messageList.handleLoadMessages = handleLoadMessages;
});

test('should load private messages on pubsub `member:select` event', async () => {
  const { handleLoadMessages } = messageList;
  const member = generate.userData({ id: generate.id(), lastVisit: Date.now() });
  const user = generate.userData({ room: generate.roomData({ id: generate.id() }) });
  const loadedMessages = privateMessages.map(message => ({ ...message, read: true }));

  mockGetState.mockReturnValue({ sender: user });
  messageList.handleLoadMessages = jest.fn();
  await messageList.selectMember(member);
  expect(messageList.handleLoadMessages).toHaveBeenCalledWith(loadedMessages);
  messageList.handleLoadMessages = handleLoadMessages;
});

test('should render', () => {
  const renderedMessages = roomMessages.map(
    message => new Message({ ...message, ...afterMessageRenderProps }),
  );

  messageList.state.messages = roomMessages;
  messageList.render();
  expect(messageList.state.messages).toEqual(renderedMessages);
});

test('should not render if no messages', () => {
  messageList.render();
  expect(messageList.state.messages).toHaveLength(0);
});
