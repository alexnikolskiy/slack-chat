import template from 'Templates/notification-bar';
import io from 'Utils/io';
import pubsub from 'Utils/pubsub';

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

  handleTyping(users, sender = null, receiver = null) {
    let userList = [...users];

    if (!receiver) {
      userList = userList.filter(user => user !== this.user.username);
    }

    if (this.isPrivate && receiver) {
      if (receiver === this.user.username && this.user.username !== this.member.username) {
        userList = userList.filter(user => user !== receiver);
      } else {
        userList = [];
      }
    } else if (!this.isPrivate && receiver) {
      userList = userList.filter(user => user !== sender);
    } else if (this.isPrivate && !receiver) {
      userList = userList.filter(user => user === receiver);
    }

    this.text = NotificationBar.getTypingText(userList);
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
