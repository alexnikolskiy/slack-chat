import pubsub from 'Utils/pubsub';
import io from 'Utils/io';
import { getRoomMessages, getPrivateMessages } from 'Utils/db';

class Chat {
  constructor() {
    this.sender = null;
    this.receiver = null;
    this.lastVisit = Date.now();
    this.components = new Set();

    io.on('login', this.ioLogin.bind(this));
    io.on('message:add', this.ioAddMessage.bind(this));
    io.on('member:join', this.ioMemberJoin.bind(this));

    pubsub.sub('room:select', this.handleSelectRoom.bind(this));
    pubsub.sub('room:join', this.handleJoinRoom.bind(this));
    pubsub.sub('message:write', this.handleWriteMessage.bind(this));
    pubsub.sub('member:select', this.selectMember.bind(this));
  }

  ioLogin(user) {
    this.sender = user;
  }

  isNotEligibleMessageForDisplay(message) {
    const isPrivateMessage = !!message.receiver;

    return (
      ((!this.receiver && isPrivateMessage) || // if private message, but we in the room
      (this.receiver && !isPrivateMessage) || // if not private message, but we are writing a private message
        (this.receiver && // if private message from one user, but we are chatting with another one (not with yourself)
          this.receiver.username !== message.sender &&
          this.sender.username !== this.receiver.username)) &&
      this.sender.username !== message.sender
    );
  }

  shouldShowNewPrivateMessageNotification(message) {
    const isPrivateMessage = !!message.receiver;

    return (
      (!this.receiver && isPrivateMessage) ||
      (this.receiver &&
        isPrivateMessage &&
        this.sender.username !== message.sender &&
        this.receiver.username !== message.sender)
    );
  }

  shouldShowNewRoomMessageNotification(message) {
    const isPrivateMessage = !!message.receiver;

    return this.receiver && !isPrivateMessage;
  }

  ioAddMessage(message) {
    if (this.sender.room === message.room) {
      if (this.shouldShowNewPrivateMessageNotification(message)) {
        pubsub.pub('message:new-private', message.sender);
      } else if (this.shouldShowNewRoomMessageNotification(message)) {
        pubsub.pub('message:new', message.room);
      }
    }

    if (this.isNotEligibleMessageForDisplay(message)) {
      return;
    }

    pubsub.pub('message:add', message);
  }

  async ioMemberJoin(roomId) {
    const messages = await this.loadMessages(roomId);
    pubsub.pub('message:load', messages);
  }

  async loadMessages(roomId) {
    let messages = await getRoomMessages(roomId);

    messages = messages.map(message => ({
      ...message,
      read: new Date(message.timestamp).getTime() <= new Date(this.lastVisit).getTime(),
    }));

    return messages;
  }

  async selectMember(member) {
    let messages = await getPrivateMessages(this.sender.room, member.id);

    messages = messages.map(message => ({
      ...message,
      read: new Date(message.timestamp).getTime() <= new Date(member.lastVisit).getTime(),
    }));
    this.receiver = member;
    pubsub.pub('message:load', messages);
  }

  async handleSelectRoom() {
    this.receiver = null;
    pubsub.pub('message:load', []);
  }

  async handleJoinRoom(room, lastVisit) {
    const messages = await this.loadMessages(room.id);

    this.lastVisit = lastVisit;
    pubsub.pub('message:load', messages);
  }

  handleWriteMessage(text) {
    io.emit('message:add', text, this.receiver);
  }

  add(component) {
    this.components.add(component);

    return this;
  }

  remove(component) {
    this.components.delete(component);

    return this;
  }

  render() {
    this.components.forEach(component => {
      component.render();
    });
  }
}

export default Chat;
