import template from 'Templates/member-list';
import { getRoomMembers } from '../services/room';
import Component from '../lib/component';
import store from '../store';

class MemberList extends Component {
  constructor(io, pubsub) {
    super({
      store,
      observedAttrs: ['receiver'],
      elem: document.querySelector('.chat-sidebar__members'),
    });

    this.state = {
      members: [],
      selected: null,
    };

    this.io = io;
    this.pubsub = pubsub;

    this.pubsub.sub('room:select', this.handleSelectRoom.bind(this));
    this.pubsub.sub('message:select-user', this.handleSelectUser.bind(this));

    this.io.on('room:join', this.ioJoinRoom.bind(this));
    this.io.on('room:leave', this.ioLeaveRoom.bind(this));
    this.io.on('online', this.ioChangeStatus.bind(this));
    this.io.on('offline', this.ioChangeStatus.bind(this));
    this.io.on('message:add', this.ioAddMessage.bind(this));
  }

  setHandlers() {
    const links = this.elem.querySelectorAll('.listitem__link');

    [...links].forEach(link => {
      link.addEventListener('click', ev => {
        ev.preventDefault();

        this.selectMember(link.dataset.id);
      });
    });
  }

  selectMember(id) {
    const member = this.state.members.find(m => m.id === id);

    this.setState({
      members: this.state.members.map(m =>
        m.id !== id ? m : { ...m, lastVisit: Date.now(), newMessages: 0 },
      ),
      selected: id,
    });

    store.dispatch('selectMember', member);
    this.pubsub.pub('member:select', member);
  }

  handleSelectUser(username) {
    const member = this.state.members.find(m => m.username === username);

    if (!member) {
      return;
    }

    this.selectMember(member.id);
  }

  async handleSelectRoom(room) {
    const members = await getRoomMembers(room.id);
    const { sender } = store.getState();

    this.setState({
      selected: null,
      members: members.map(member => ({
        ...member,
        isLoggedUser: member.id === sender.id,
        lastVisit: Date.now(),
        newMessages: 0,
      })),
    });

    this.pubsub.pub('member:join', this.state.members);
  }

  handleNewMessage(memberName) {
    this.setState({
      members: this.state.members.map(member =>
        member.username !== memberName
          ? member
          : { ...member, newMessages: member.newMessages + 1 },
      ),
    });
  }

  ioJoinRoom({ user }) {
    if (this.state.members.find(member => member.id === user.id)) {
      return;
    }

    this.setState({
      members: [
        ...this.state.members,
        {
          ...user,
          isLoggedUser: false,
          lastVisit: Date.now(),
        },
      ],
    });

    this.pubsub.pub('member:join', this.state.members);
  }

  ioLeaveRoom({ user }) {
    this.setState({
      members: this.state.members.filter(member => member.username !== user.username),
    });
    this.pubsub.pub('room:leave', this.state.members);
  }

  ioChangeStatus(user) {
    this.setState({
      members: this.state.members.map(member =>
        member.id !== user.id ? member : { ...member, online: user.online },
      ),
    });
  }

  ioAddMessage(message) {
    const { sender, receiver } = store.getState();
    const isPrivateMessage = !!message.receiver;
    const isPrivateChatting = !!receiver;

    if (sender.room.id !== message.room.id) {
      return;
    }

    if (
      (!isPrivateChatting && isPrivateMessage) ||
      (isPrivateChatting &&
        isPrivateMessage &&
        sender.username !== message.sender.username &&
        receiver.username !== message.sender.username)
    ) {
      this.handleNewMessage(message.sender.username);
    }
  }

  render() {
    const members = this.state.members
      .map(member => ({ ...member, selected: member.id === this.state.selected }))
      .sort((a, b) => a.username.localeCompare(b.username))
      .sort((a, b) => +b.online - +a.online);
    this.elem.innerHTML = template({ members });
    this.setHandlers();
  }
}

export default MemberList;
