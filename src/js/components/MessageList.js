import Message from './message/index';
import MessageNewOutput from './message/output/messageNewOutput';
import MessageEditOutput from './message/output/messageEditOutput';
import MessageOutput from './message/output/messageOutput';
import MessageRepeatedOutput from './message/output/messageRepeatedOutput';
import store from '../store';
import Component from '../lib/component';
import { getRoomMessages, getPrivateMessages } from '../services/room';

class MessageList extends Component {
  constructor(io, pubsub) {
    super({
      store,
      elem: document.querySelector('.chat-box__body-list'),
    });

    this.state = {
      messages: [],
    };
    this.io = io;
    this.pubsub = pubsub;

    this.handleMessageMouseOver = this.handleMessageMouseOver.bind(this);
    this.handleMessageMouseOut = this.handleMessageMouseOut.bind(this);
    this.setHandlers();

    this.io.on('room:join', this.ioJoinOrLeaveRoom.bind(this));
    this.io.on('room:leave', this.ioJoinOrLeaveRoom.bind(this));
    this.io.on('message:add', this.ioAddMessage.bind(this));
    this.io.on('message:edit', this.ioEditMessage.bind(this));
    this.io.on('message:delete', this.ioDeleteMessage.bind(this));
    this.io.on('member:edit', this.ioMemberEdit.bind(this));

    this.pubsub.sub('message:add', this.handleAddMessage.bind(this));
    this.pubsub.sub('message:edit', this.handleEditMessage.bind(this));
    this.pubsub.sub('message:cancel', this.handleCancelEditMessage.bind(this));
    this.pubsub.sub('message:save', this.handleSaveMessage.bind(this));
    this.pubsub.sub('message:edit-last', this.handleEditLastMessage.bind(this));
    this.pubsub.sub('message:delete', this.handleDeleteMessage.bind(this));
    this.pubsub.sub('editor:new-line', this.scroll.bind(this));
    this.pubsub.sub('room:select', this.handleSelectRoom.bind(this));
    this.pubsub.sub('member:select', this.selectMember.bind(this));
  }

  handleMessageMouseOver(ev) {
    const messageElem = ev.target.closest('.message');

    if (!messageElem || messageElem.classList.contains('message_editing')) {
      return;
    }

    const messageId = messageElem.dataset.id;
    const actionsElem = messageElem.getElementsByClassName('message__action-list')[0];

    if (!actionsElem && messageId) {
      const message = this.state.messages.find(msg => msg.id === messageId);
      const { sender } = store.getState();

      if (!message) {
        return;
      }

      const isOwnMessage = message.sender.username === sender.username;
      messageElem.append(message.renderActions({ isOwnMessage, isAutomated: message.automated }));
    }
  }

  handleMessageMouseOut(ev) {
    const messageElem = ev.target.closest('.message');

    if (!messageElem || messageElem.classList.contains('message_editing')) {
      return;
    }

    let where = null;
    if (ev.relatedTarget) {
      where = ev.relatedTarget.closest('.message__action-list');
    }

    const elems = this.elem.querySelectorAll('.message__action-list');
    elems.forEach(elem => {
      if (elem !== where) {
        elem.parentElement.removeChild(elem);
      }
    });
  }

  setHandlers() {
    this.elem.addEventListener('mouseover', this.handleMessageMouseOver);
    this.elem.addEventListener('mouseout', this.handleMessageMouseOut);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 1) {
          return;
        }

        const elem = mutation.addedNodes[0];
        if (!elem || !elem.classList.contains('message_editing')) {
          return;
        }

        const input = elem.querySelector('.message__editor-input');
        input.setAttribute('style', `height:${input.scrollHeight}px;`);
        input.focus();
        setTimeout(() => {
          input.selectionStart = input.value.length;
          input.selectionEnd = input.value.length;
        }, 0);
      });
    });

    observer.observe(this.elem, {
      childList: true,
    });
  }

  ioJoinOrLeaveRoom({ message, user }) {
    const newMessage = new Message({
      id: message.id,
      sender: user,
      text: message.text,
      automated: true,
    });

    this.setState({
      messages: [...this.state.messages, newMessage],
    });
  }

  ioAddMessage(message) {
    const isPrivateMessage = !!message.receiver;
    const { sender, receiver } = store.getState();
    const isPrivateChatting = !!receiver;

    if (
      ((!isPrivateChatting && isPrivateMessage) || // if private message, but we in the room
      (isPrivateChatting && !isPrivateMessage) || // if not private message, but we are writing a private message
        (isPrivateChatting &&
        isPrivateMessage && // if private message from one user, but we are chatting with another one and not with yourself
          receiver.username !== message.sender.username &&
          sender.username !== receiver.username)) &&
      sender.username !== message.sender.username
    ) {
      return;
    }

    this.setState({
      messages: [...this.state.messages, new Message({ ...message, read: true })],
    });
  }

  ioEditMessage(message) {
    this.setState({
      messages: this.state.messages.map(msg =>
        msg.id !== message.id
          ? msg
          : new Message({
              ...msg,
              text: message.text,
              edited: true,
              hasChanges: true,
            }),
      ),
    });
  }

  ioDeleteMessage(id) {
    const message = this.state.messages.find(msg => msg.id === id);

    if (!message) {
      return;
    }

    this.deleteMessage(message);
  }

  ioMemberEdit(member) {
    const messages = this.state.messages
      .filter(msg => msg.sender.username === member.username)
      .map(
        msg =>
          new Message({
            ...msg,
            sender: member,
            hasChanges: true,
            elem: msg.elem,
          }),
      );

    this.setState({
      messages: [
        ...this.state.messages.filter(msg => msg.sender.username !== member.username),
        ...messages,
      ],
    });
  }

  handleAddMessage(message) {
    this.setState({
      messages: [...this.state.messages, new Message({ ...message, read: true })],
    });
  }

  setMessage(message) {
    this.setState({
      messages: this.state.messages.map(msg => (msg.id !== message.id ? msg : message)),
    });
  }

  handleEditMessage(message) {
    this.setMessage(message);
  }

  handleCancelEditMessage(message) {
    this.setMessage(message);
  }

  handleSaveMessage(message, hasChanges) {
    this.setMessage(message);

    if (hasChanges) {
      this.io.emit('message:edit', message);
    }
  }

  handleEditLastMessage() {
    const { sender } = store.getState();
    const message = this.state.messages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .find(msg => msg.sender.username === sender.username && !msg.automated);

    if (!message) {
      return;
    }

    this.setState({
      messages: this.state.messages.map(msg =>
        msg.id !== message.id
          ? msg
          : new Message({
              ...message,
              editing: true,
              hasChanges: true,
            }),
      ),
    });
  }

  handleDeleteMessage(message) {
    this.deleteMessage(message);
    this.io.emit('message:delete', message.id);
  }

  deleteMessage(message) {
    let messages;
    const idx = this.state.messages.findIndex(msg => msg.id === message.id);

    this.elem.removeChild(message.elem);
    messages = this.state.messages.filter(msg => msg.id !== message.id);

    if (messages[idx]) {
      messages = [
        ...messages.slice(0, idx),
        new Message({ ...messages[idx], hasChanges: true }),
        ...messages.slice(idx + 1),
      ];
    }

    this.setState({ messages });
  }

  handleLoadMessages(messages = []) {
    this.elem.innerHTML = '';
    this.setState({
      messages: messages.map(message => new Message(message)),
    });
    this.scroll(true);
  }

  async handleSelectRoom(room, lastVisit) {
    this.state.messages = [];

    let messages = await getRoomMessages(room.id);

    messages = messages.map(message => ({
      ...message,
      read: new Date(message.timestamp).getTime() <= new Date(lastVisit).getTime(),
    }));

    this.handleLoadMessages(messages);
  }

  async selectMember(member) {
    const { sender } = store.getState();
    let messages = await getPrivateMessages(sender.room.id, member.id);

    messages = messages.map(message => ({
      ...message,
      read: new Date(message.timestamp).getTime() <= new Date(member.lastVisit).getTime(),
    }));

    this.handleLoadMessages(messages);
  }

  scroll(clear = false) {
    const parentElem = this.elem.parentElement;
    const lastMessage = this.state.messages[this.state.messages.length - 1];
    const { sender } = store.getState();

    if (!lastMessage) {
      return;
    }

    const lastElem = lastMessage.elem;
    const height = parentElem.scrollTop + parentElem.clientHeight + lastElem.clientHeight;

    if (
      height === parentElem.scrollHeight ||
      lastMessage.sender.username === sender.username ||
      clear
    ) {
      parentElem.scrollTop = parentElem.scrollHeight;
    }
  }

  render() {
    let prevSender;
    let isSetNewMessagesLabel = false;

    if (!this.state.messages) {
      return;
    }

    this.state.messages = this.state.messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(message => {
        let newElem;

        if (message.rendered && !message.hasChanges) {
          prevSender = message.sender.username;
          return message;
        }

        if (message.editing) {
          newElem = message.render(new MessageEditOutput());
        } else if (message.sender.username !== prevSender) {
          newElem = message.render(new MessageOutput());
        } else {
          newElem = message.render(new MessageRepeatedOutput());
        }

        prevSender = message.sender.username;

        return new Message({ ...message, elem: newElem, pubsub: this.pubsub });
      });

    this.state.messages.forEach(message => {
      if (message.rendered && !message.hasChanges) {
        prevSender = message.sender.username;
        return;
      }

      if (!message.read && !message.automated && !isSetNewMessagesLabel) {
        const newMessagesElem = message.render(new MessageNewOutput());
        this.elem.appendChild(newMessagesElem);
        isSetNewMessagesLabel = true;
      }

      if (!message.hasChanges) {
        this.elem.appendChild(message.elem);
      } else {
        const elem = this.elem.querySelector(`li[data-id="${message.id}"]`);

        if (elem) {
          elem.replaceWith(message.elem);
        }
      }

      prevSender = message.sender.username;
    });

    this.state.messages = this.state.messages.map(
      message => new Message({ ...message, read: true, rendered: true }),
    );

    this.scroll();
  }
}

export default MessageList;
