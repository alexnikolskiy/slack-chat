import pubsub from 'Utils/pubsub';
import io from 'Utils/io';
import Message from './message/index';
import MessageNewOutput from './message/output/messageNewOutput';
import MessageEditOutput from './message/output/messageEditOutput';
import MessageOutput from './message/output/messageOutput';
import MessageRepeatedOutput from './message/output/messageRepeatedOutput';

class MessageList {
  constructor() {
    this._messages = [];
    this.sender = null;

    this.elem = document.querySelector('.chat-box__body-list');
    this.setHandlers();

    io.on('login', this.ioLogin.bind(this));
    io.on('room:join', this.ioJoinOrLeaveRoom.bind(this));
    io.on('room:leave', this.ioJoinOrLeaveRoom.bind(this));
    io.on('message:edit', this.ioEditMessage.bind(this));
    io.on('message:delete', this.ioDeleteMessage.bind(this));
    io.on('member:edit', this.ioMemberEdit.bind(this));

    pubsub.sub('message:add', this.handleAddMessage.bind(this));
    pubsub.sub('message:edit', this.handleEditMessage.bind(this));
    pubsub.sub('message:cancel', this.handleCancelEditMessage.bind(this));
    pubsub.sub('message:save', this.handleSaveMessage.bind(this));
    pubsub.sub('message:edit-last', this.handleEditLastMessage.bind(this));
    pubsub.sub('message:delete', this.handleDeleteMessage.bind(this));
    pubsub.sub('message:load', this.handleLoadMessages.bind(this));
    pubsub.sub('editor:new-line', this.scroll.bind(this));
  }

  setHandlers() {
    this.elem.addEventListener('mouseover', ev => {
      const messageElem = ev.target.closest('.message');

      if (!messageElem || messageElem.classList.contains('message_editing')) {
        return;
      }

      const messageId = messageElem.dataset.id;
      const actionsElem = messageElem.getElementsByClassName('message__action-list')[0];

      if (!actionsElem && messageId) {
        const message = this.messages.find(msg => msg.id === messageId);

        if (!message) {
          return;
        }

        const isOwnMessage = message.sender === this.sender.username;
        messageElem.append(message.renderActions({ isOwnMessage, isAutomated: message.automated }));
      }
    });

    this.elem.addEventListener('mouseout', ev => {
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
    });

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

  get messages() {
    return this._messages;
  }

  set messages(messages) {
    this._messages = messages;
    this.render();
  }

  async ioLogin(user) {
    this.sender = user;
  }

  ioJoinOrLeaveRoom(data) {
    const message = new Message({
      id: data.message.id,
      sender: data.user.username,
      avatar: data.user.avatar,
      text: data.message.text,
      automated: true,
    });

    this.messages = [...this.messages, message];
  }

  ioEditMessage(message) {
    this.messages = this.messages.map(msg =>
      msg.id !== message.id
        ? msg
        : new Message({
            ...msg,
            text: message.text,
            edited: true,
            hasChanges: true,
          }),
    );
  }

  ioDeleteMessage(id) {
    const message = this.messages.find(msg => msg.id === id);

    if (!message) {
      return;
    }

    this.deleteMessage(message);
  }

  ioMemberEdit(member) {
    const messages = this.messages
      .filter(msg => msg.sender === member.username)
      .map(
        msg =>
          new Message({
            ...msg,
            avatar: member.avatar,
            hasChanges: true,
            elem: msg.elem,
          }),
      );

    this.messages = [...this.messages.filter(msg => msg.sender !== member.username), ...messages];
  }

  handleAddMessage(message) {
    this.messages = [...this.messages, new Message({ ...message, read: true })];
  }

  handleEditMessage(message) {
    this.messages = this.messages.map(msg => (msg.id !== message.id ? msg : message));
  }

  handleCancelEditMessage(message) {
    this.messages = this.messages.map(msg => (msg.id !== message.id ? msg : message));
  }

  handleSaveMessage(message, hasChanges) {
    this.messages = this.messages.map(msg => (msg.id !== message.id ? msg : message));

    if (hasChanges) {
      io.emit('message:edit', message);
    }
  }

  handleEditLastMessage() {
    const message = this.messages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .find(msg => msg.sender === this.sender.username && !msg.automated);

    if (!message) {
      return;
    }

    this.messages = this.messages.map(msg =>
      msg.id !== message.id
        ? msg
        : new Message({
            ...message,
            editing: true,
            hasChanges: true,
          }),
    );
  }

  handleDeleteMessage(message) {
    this.deleteMessage(message);
    io.emit('message:delete', message.id);
  }

  deleteMessage(message) {
    let messages;
    const idx = this.messages.findIndex(msg => msg.id === message.id);

    this.elem.removeChild(message.elem);
    messages = this.messages.filter(msg => msg.id !== message.id);

    if (messages[idx]) {
      messages = [
        ...messages.slice(0, idx),
        new Message({ ...messages[idx], hasChanges: true }),
        ...messages.slice(idx),
      ];
    }

    this.messages = messages;
  }

  handleLoadMessages(messages = []) {
    this.elem.innerHTML = '';
    this.messages = messages.map(message => new Message(message));
    this.scroll(true);
  }

  scroll(clear = false) {
    const parentElem = this.elem.parentElement;
    const lastMessage = this.messages[this.messages.length - 1];

    if (!lastMessage) {
      return;
    }

    const lastElem = lastMessage.elem;
    const height = parentElem.scrollTop + parentElem.clientHeight + lastElem.clientHeight;

    if (
      height === parentElem.scrollHeight ||
      lastMessage.sender === this.sender.username ||
      clear
    ) {
      parentElem.scrollTop = parentElem.scrollHeight;
    }
  }

  render() {
    let prevSender;
    let isSetNewMessagesLabel = false;

    this._messages = this._messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(message => {
        let newElem;

        if (message.rendered && !message.hasChanges) {
          prevSender = message.sender;
          return message;
        }

        if (message.editing) {
          newElem = message.render(new MessageEditOutput());
        } else if (message.sender !== prevSender) {
          newElem = message.render(new MessageOutput());
        } else {
          newElem = message.render(new MessageRepeatedOutput());
        }

        prevSender = message.sender;

        return new Message({ ...message, elem: newElem });
      });

    this._messages.forEach(message => {
      if (message.rendered && !message.hasChanges) {
        prevSender = message.sender;
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
        elem.replaceWith(message.elem);
      }

      prevSender = message.sender;
    });

    this._messages = this._messages.map(
      message => new Message({ ...message, read: true, rendered: true }),
    );

    this.scroll();
  }
}

export default MessageList;
