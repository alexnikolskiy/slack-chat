import template from 'Templates/notification-bar';
import io from 'Utils/io';
import pubsub from 'Utils/pubsub';

class NotificationBar {
  constructor() {
    this.elem = document.querySelector('.notification-bar');
    this.text = '';
    this.sender = null;
    this.receiver = null;

    pubsub.sub('member:select', this.handleSelectMember.bind(this));
    pubsub.sub('room:select', this.handleSelectRoom.bind(this));

    io.on('editor:typing', this.ioMessageTyping.bind(this));
    io.on('login', this.ioLogin.bind(this));
  }

  static getTypingText(users) {
    let text = '';
    const userList = users.map(user => `<b>${user}</b>`);

    if (userList.length === 1) {
      text = `${userList[0]} is typing`;
    } else if (userList.length === 2) {
      text = `${userList.join(' and ')} are typing`;
    } else if (userList.length > 2) {
      text = 'Several people are typing';
    }

    return text;
  }

  ioMessageTyping(users, sender, receiver = null) {
    const isPrivateChatting = !!this.receiver;
    let userList = users.filter(user => user !== this.sender.username);

    if (
      (!isPrivateChatting && receiver) ||
      (isPrivateChatting && !receiver) ||
      (isPrivateChatting && this.receiver.username === this.sender.username)
    ) {
      userList = [];
    }

    this.text = NotificationBar.getTypingText(userList);
    this.render();
  }

  handleSelectMember(member) {
    this.receiver = member;
  }

  handleSelectRoom() {
    this.receiver = null;
  }

  ioLogin(user) {
    this.sender = user;
  }

  render() {
    this.elem.innerHTML = template({ text: this.text });
  }
}

export default NotificationBar;
