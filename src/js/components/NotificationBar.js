import template from 'Templates/notification-bar';
import Component from '../lib/component';
import store from '../store';

class NotificationBar extends Component {
  constructor(io, pubsub) {
    super({
      store,
      elem: document.querySelector('.notification-bar'),
    });

    this.state = {
      text: '',
    };
    this.io = io;
    this.pubsub = pubsub;

    this.io.on('editor:typing', this.ioMessageTyping.bind(this));
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

  ioMessageTyping(users, isPrivateMessage) {
    const { sender, receiver } = store.getState();
    const isPrivateChatting = !!receiver;
    let userList = users.filter(user => user !== sender.username);

    if (
      (isPrivateMessage && !isPrivateChatting) ||
      (!isPrivateMessage && isPrivateChatting) ||
      (isPrivateMessage && isPrivateChatting && receiver.username === sender.username)
    ) {
      userList = [];
    }

    this.setState({
      text: NotificationBar.getTypingText(userList),
    });
  }

  render() {
    this.elem.innerHTML = template({ text: this.state.text });
  }
}

export default NotificationBar;
