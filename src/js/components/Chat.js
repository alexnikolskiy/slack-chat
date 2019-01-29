import pubsub from 'Utils/pubsub';
import io from 'Utils/io';
import { getRoomMessages, getPrivateMessages } from 'Utils/helpers';
import Message from './message/index';
import MessageOutput from './message/output/messageOutput';
import MessageRepeatedOutput from './message/output/messageRepeatedOutput';
import MessageEditOutput from './message/output/messageEditOutput';
import MessageNewOutput from './message/output/messageNewOutput';

class Chat {
  constructor() {
    this.elem = document.querySelector('.chat-box__body-list');
    this.messages = [];
    this.sender = null;
    this.receiver = null;
    this.lastVisit = Date.now();
    this.setHandlers();

    io.on('room:join', this.ioJoinRoom.bind(this));
    io.on('room:leave', this.ioLeaveRoom.bind(this));
    io.on('message:add', this.ioAddMessage.bind(this));
    io.on('login', this.ioLogin.bind(this));
    io.on('message:edit', this.ioEditMessage.bind(this));
    io.on('message:delete', this.ioDeleteMessage.bind(this));
    io.on('member:join', this.loadMessages.bind(this));

    pubsub.sub('room:join', this.loadMessages.bind(this));
    pubsub.sub('room:select', this.selectRoom.bind(this));
    pubsub.sub('editor:new-line', this.scroll.bind(this));
    pubsub.sub('message:edit', this.editMessage.bind(this));
    pubsub.sub('message:cancel', this.cancelEditMessage.bind(this));
    pubsub.sub('message:save', this.saveMessage.bind(this));
    pubsub.sub('message:edit-last', this.editLastMessage.bind(this));
    pubsub.sub('message:delete', this.deleteMessage.bind(this));
    pubsub.sub('member:select', this.selectMember.bind(this));
    pubsub.sub('message:add', this.addMessage.bind(this));
  }

  setHandlers() {
    this.elem.addEventListener('mouseover', (ev) => {
      const messageElem = ev.target.closest('.message');

      if (!messageElem || messageElem.classList.contains('message_editing')) { return; }

      const messageId = messageElem.dataset.id;
      const actionsElem = messageElem.getElementsByClassName('message__action-list')[0];

      if (!actionsElem && messageId) {
        const message = this.messages.find(message => message.id === messageId);
        const isOwnMessage = message.sender === this.sender.username;

        messageElem.append(message.renderActions({ isOwnMessage, isAutomated: message.automated }));
      }
    });

    this.elem.addEventListener('mouseout', (ev) => {
      const messageElem = ev.target.closest('.message');

      if (!messageElem || messageElem.classList.contains('message_editing') || !ev.relatedTarget) { return; }

      const where = ev.relatedTarget.closest('.message__action-list');
      const elems = this.elem.querySelectorAll('.message__action-list');

      elems.forEach(elem => {
        if (elem !== where) {
          elem.parentElement.removeChild(elem);
        }
      });
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 1) { return; }

        const elem = mutation.addedNodes[0];
        if (!elem || !elem.classList.contains('message_editing')) { return; }

        const input = elem.querySelector('.message__editor-input');
        input.setAttribute('style', 'height:' + (input.scrollHeight) + 'px;');
        input.focus();
        setTimeout(function(){ input.selectionStart = input.selectionEnd = input.value.length; }, 0);
      })
    });

    observer.observe(this.elem, {
      childList: true
    })
  }

  ioLogin(user) {
    this.sender = user;
  }

  ioJoinRoom(user) {
    const message = new Message({
      id: user.message,
      sender: user.username,
      text: `joined #${user.room.name}`,
      automated: true,
    });

    this.messages.push(message);
    this.render();
  }

  ioLeaveRoom(user) {
    const message = new Message({
      id: user.message,
      sender: user.username,
      text: `left #${user.room.name}`,
      automated: true,
    });

    this.messages.push(message);
    this.render();
  }

  ioAddMessage(message, isPrivate) {
    if (this.sender.room === message.room) {
      if (!this.receiver && isPrivate) {
        pubsub.pub('message:new-private', message.sender);
      } else if (this.receiver && !isPrivate) {
        pubsub.pub('message:new', message.room);
      } else if (this.receiver && isPrivate && this.sender.username !== message.sender && this.receiver.username !== message.sender) {
        pubsub.pub('message:new-private', message.sender);
      }
    }

    if ((!this.receiver && isPrivate
      || this.receiver && this.receiver.username !== message.sender
      || this.receiver && !isPrivate)
    && (this.sender.username !== message.sender)) { return; }

    message.read = true;
    io.emit('message:read', message.id);
    this.messages.push(new Message(message));

    this.render();
  }

  ioEditMessage(message) {
    const msg = this.messages.find(msg => msg.id === message.id);

    if (!msg) { return; }

    msg.text = message.text;
    msg.edited = true;
    msg.hasChanges = true;
    this.render();
  }

  ioDeleteMessage(id) {
    const message = this.messages.find(msg => msg.id === id);

    if (!message) { return; }

    this.elem.removeChild(message.elem);
    const idx = this.messages.findIndex(msg => msg.id === id);
    this.messages = this.messages.filter(msg => msg.id !== id);
    if (this.messages[idx]) {
      this.messages[idx].hasChanges = true;
      this.render();
    }
  }

  async loadMessages(room) {
    const messages = await getRoomMessages(room.id);

    this.messages = messages
      .map(message => new Message({
        ...message,
        read: new Date(message.timestamp).getTime() <= new Date(this.lastVisit).getTime(),
      }));
    this.render(true);
  }

  joinRoom(room, lastVisit) {
    this.lastVisit = lastVisit;
  }

  editMessage(message) {
    this.render();
  }

  cancelEditMessage(message) {
    this.render();
  }

  saveMessage(message, hasChanges) {
    if (hasChanges) {
      io.emit('message:edit', message);
    }
    this.render();
  }

  editLastMessage() {
    const message = this.messages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .find(msg => msg.sender === this.sender.username && !msg.automated);

    if (!message) { return; }

    message.editing = true;
    message.hasChanges = true;
    this.render();
  }

  deleteMessage(message) {
    this.elem.removeChild(message.elem);
    const idx = this.messages.findIndex(msg => msg.id === message.id);
    this.messages = this.messages.filter(msg => msg.id !== message.id);

    if (this.messages[idx]) {
      this.messages[idx].hasChanges = true;
      this.render();
    }

    io.emit('message:delete', message.id);
  }

  async selectMember(member) {
    const messages = await getPrivateMessages(this.sender.room, member.id);

    this.messages = messages.map(message => new Message({
      ...message,
      read: new Date(message.timestamp).getTime() <= new Date(member.lastVisit).getTime(),
    }));
    this.receiver = member;
    this.render(true);
  }

  selectRoom(room, lastVisit) {
    this.receiver = null;
    this.lastVisit = lastVisit;
  }

  addMessage(text) {
    io.emit('message:add', text, this.sender, this.receiver);
  }

  scroll(clear) {
    const parentElem = this.elem.parentElement;
    const lastMessage = this.messages[this.messages.length - 1];

    if (!lastMessage) { return; }

    const lastElem = lastMessage.elem;
    const height = parentElem.scrollTop + parentElem.clientHeight + lastElem.clientHeight;

    if (height === parentElem.scrollHeight
      || parentElem.scrollTop === 0
      || lastMessage.sender === this.sender.username
      || clear) {
      parentElem.scrollTop = parentElem.scrollHeight;
    }
  }

  render(clear = false) {
    const messageOutput = new MessageOutput();
    const messageRepeatedOutput = new MessageRepeatedOutput();
    const messageEditOutput = new MessageEditOutput();
    const messageNewOutput = new MessageNewOutput();

    let newElem;
    let prevSender;
    let isReaded = true;
    let isSetNewMessagesLabel = false;

    if (clear) {
      this.elem.innerHTML = '';
    }

    this.messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .forEach(message => {
        if (message.rendered && !message.hasChanges) {
          prevSender = message.sender;
          return;
        }

        if (message.read !== isReaded && !message.automated && !isSetNewMessagesLabel) {
          newElem = message.render(messageNewOutput);
          this.elem.appendChild(newElem);
          isSetNewMessagesLabel = true;
        }

        if (message.editing) {
          newElem = message.render(messageEditOutput);
        } else if (message.sender !== prevSender) {
          newElem = message.render(messageOutput);
        } else {
          newElem = message.render(messageRepeatedOutput);
        }

        if (!message.hasChanges) {
          this.elem.appendChild(newElem);
        } else {
          message.elem.replaceWith(newElem);
        }

        prevSender = message.sender;
        isReaded = message.read;
        message.rendered = true;
        message.elem = newElem;
      });

    this.scroll(clear);
  }
}

export default Chat;
