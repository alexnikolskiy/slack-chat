import template from 'Templates/chat-header';
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
      online: false,
    };

    pubsub.sub('room:leave', this.handleLeaveRoom.bind(this));
    pubsub.sub('room:select', this.handleSelectRoom.bind(this));
    pubsub.sub('member:join', this.handleMemberJoin.bind(this));
    pubsub.sub('member:select', this.handleMemberSelect.bind(this));

    io.on('online', this.ioChangeStatus.bind(this));
    io.on('offline', this.ioChangeStatus.bind(this));
  }

  getInfo(data, isMember) {
    if (!data) {
      return '';
    }

    if (data instanceof Array) {
      const count = data.length;
      const infoText = count === 1 ? 'member' : 'members';

      return `${count} ${infoText}`;
    }

    const infoText = data.online ? 'online' : 'offline';
    const isMemberSelected = isMember === undefined ? this.state.isMember : isMember;

    return `${isMemberSelected ? infoText : this.state.info}`;
  }

  handleMemberJoin(members = []) {
    this.state = {
      ...this.state,
      info: this.getInfo(members),
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
      info: this.getInfo(members),
    };
    this.render();
  }

  handleSelectRoom(room) {
    this.state = {
      ...this.state,
      title: `# ${room.name}`,
      info: '',
      isLoggedUser: false,
      isMember: false,
    };
  }

  handleMemberSelect(member) {
    this.state = {
      ...this.state,
      title: member.username,
      info: this.getInfo(member, true),
      isLoggedUser: member.isLoggedUser,
      isMember: true,
      online: member.online,
    };
    this.render();
  }

  ioChangeStatus(member) {
    this.state = {
      ...this.state,
      info: this.getInfo(member),
      online: member.online,
    };
    this.render();
  }

  render() {
    this.elem.innerHTML = template(this.state);
  }
}

export default ChatHeader;
