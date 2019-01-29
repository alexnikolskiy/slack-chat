import template from 'Templates/notification-bar';
import io from 'Utils/io';
import pubsub from "Utils/pubsub";

class NotificationBar {
  constructor() {
    this.elem = document.querySelector('.notification-bar');
    this.text = '';
    this.user = null;
    this.isPrivate = false;
    this.member = null;

    pubsub.sub('member:select', this.handleSelectMember.bind(this));
    pubsub.sub('room:join', this.handleSelectRoom.bind(this));
    pubsub.sub('room:select', this.handleSelectRoom.bind(this));

    io.on('editor:typing', this.handleTyping.bind(this));
    io.on('login', this.ioLogin.bind(this));
  }

  getTypingText(users) {
    let text = '';

    users = users.map(user => `<b>${user}</b>`);

    if (users.length === 1) {
      text = users[0] + ' is typing';
    } else if (users.length === 2) {
      text = users.join(' and ') + ' are typing';
    } else if (users.length > 2) {
      text = 'Several people are typing';
    }

    return text;
  }

  handleTyping(users, sender = null, receiver = null) {

    if (!receiver) {
      users = users.filter(user => user !== this.user.username);
    }

    if (this.isPrivate && receiver) {
      if (receiver === this.user.username && this.user.username !== this.member.username) {
        users = users.filter(user => user !== receiver);
      } else {
        users = [];
      }
    } else if (!this.isPrivate && receiver) {
      users = users.filter(user => user !== sender);
    } else if (this.isPrivate && !receiver) {
      users = users.filter(user => user === receiver);
    }

    this.text = this.getTypingText(users);
    this.render();
  }

  handleSelectMember(member) {
    this.isPrivate = true;
    this.member = member;
  }

  handleSelectRoom() {
    this.isPrivate = false;
    this.member = null;
  }

  ioLogin(user) {
    this.user = user;
  }

  render() {
    this.elem.innerHTML = template({ text: this.text });
  }
}

export default NotificationBar;
