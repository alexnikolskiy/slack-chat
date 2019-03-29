import template from 'Templates/chat-header';
import store from '../store';
import Component from '../lib/component';

class ChatHeader extends Component {
  constructor(io, pubsub) {
    super({
      store,
      elem: document.querySelector('.chat-box__header'),
    });

    this.state = {
      title: '',
      info: '',
      online: false,
      isMember: false,
    };
    this.io = io;
    this.pubsub = pubsub;

    this.pubsub.sub('room:leave', this.handleLeaveRoom.bind(this));
    this.pubsub.sub('room:select', this.handleSelectRoom.bind(this));
    this.pubsub.sub('member:join', this.handleMemberJoin.bind(this));
    this.pubsub.sub('member:select', this.handleMemberSelect.bind(this));

    this.io.on('online', this.ioChangeStatus.bind(this));
    this.io.on('offline', this.ioChangeStatus.bind(this));
  }

  getTitle(data) {
    if (!data) {
      return this.state.title;
    }

    const { sender, receiver } = store.getState();
    const isPrivateChatting = !!receiver;
    let title;

    if (isPrivateChatting) {
      title = data.username;

      if (sender.username === data.username) {
        title += ' <span class="chat-box__header-you">(you)</span>';
      }
    } else {
      title = `# ${data.name}`;
    }

    return title;
  }

  getInfo(data) {
    if (!data) {
      return this.state.info;
    }

    if (data instanceof Array) {
      const count = data.length;
      const infoText = count === 1 ? 'member' : 'members';

      return `${count} ${infoText}`;
    }

    const infoText = data.online ? 'online' : 'offline';
    const { receiver } = store.getState();
    const isPrivateChatting = !!receiver;

    return `${isPrivateChatting ? infoText : this.state.info}`;
  }

  handleMemberJoin(members = []) {
    this.setState({
      info: this.getInfo(members),
    });
  }

  handleLeaveRoom(members) {
    this.setState({
      info: this.getInfo(members),
    });
  }

  handleSelectRoom(room) {
    this.setState({
      title: this.getTitle(room),
      info: '',
      isMember: false,
    });
  }

  handleMemberSelect(member) {
    this.setState({
      title: this.getTitle(member),
      info: this.getInfo(member),
      online: member.online,
      isMember: true,
    });
  }

  ioChangeStatus(member) {
    this.setState({
      info: this.getInfo(member),
      online: member.online,
    });
  }

  render() {
    this.elem.innerHTML = template(this.state);
  }
}

export default ChatHeader;
