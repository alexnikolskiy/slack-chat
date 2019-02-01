import chatHeaderTemplate from 'Templates/chat-header';
import pubsub from 'Utils/pubsub';
import io from 'Utils/io';

class ChatHeader {
  constructor() {
    this.elem = document.querySelector('.chat-box__header');
    this.state = {
      title: '',
      info: '',
      isLoggedUser: false,
      isMember: false,
    };

    pubsub.sub('room:leave', this.handleLeaveRoom.bind(this));
    pubsub.sub('member:join', this.handleMemberJoin.bind(this));
    pubsub.sub('room:join', this.handleJoinRoom.bind(this));
    pubsub.sub('member:select', this.handleMemberSelect.bind(this));

    io.on('online', this.ioChangeStatus.bind(this));
    io.on('offline', this.ioChangeStatus.bind(this));
  }

  handleMemberJoin(members) {
    this.state = {
      ...this.state,
      info: `${members.length} members`,
    };
    this.render();
  }

  handleJoinRoom(room) {
    this.state = {
      ...this.state,
      title: `# ${room.name}`,
      info: '',
      isLoggedUser: false,
      isMember: false,
    };
    this.render();
  }

  handleLeaveRoom(members) {
    this.state = {
      ...this.state,
      info: `${members.length} members`,
    };
    this.render();
  }

  handleMemberSelect(member) {
    this.state = {
      ...this.state,
      title: member.username,
      info: member.online ? 'online' : 'offline',
      isLoggedUser: member.isLoggedUser,
      isMember: true,
      online: member.online,
    };
    this.render();
  }

  ioChangeStatus({ online }) {
    const status = online ? 'online' : 'offline';

    this.state = {
      ...this.state,
      info: this.state.isMember ? status : this.state.info,
      online,
    };
    this.render();
  }

  render() {
    this.elem.innerHTML = chatHeaderTemplate(this.state);
  }
}

export default ChatHeader;
