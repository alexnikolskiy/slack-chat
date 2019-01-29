import pubsub from 'Utils/pubsub';
import io from 'Utils/io';
import { getRoomMembers } from 'Utils/helpers';
import memberListTemplate from 'Templates/member-list';

class MemberList {
  constructor() {
    this.elem = document.querySelector('.chat-sidebar__members');
    this.members = [];
    this.selected = null;
    this.user = null;

    pubsub.sub('room:select', this.selectRoom.bind(this));
    pubsub.sub('message:select-user', this.selectUser.bind(this));
    pubsub.sub('message:new-private', this.handleNewMessage.bind(this));

    io.on('room:join', this.ioJoinRoom.bind(this));
    io.on('room:leave', this.ioLeaveRoom.bind(this));
    io.on('login', this.ioLogin.bind(this));
    io.on('offline', this.ioChangeStatus.bind(this));
    io.on('online', this.ioChangeStatus.bind(this));
  }

  setHandlers() {
    const links = this.elem.querySelectorAll('.listitem__link');

    [...links].forEach((link) => {
      link.addEventListener('click', (ev) => {
        ev.preventDefault();

        this.selectMember(link.dataset.id);
      });
    });
  }

  selectMember(id) {
    const member = this.members.find(member => member.id === id);

    this.selected = member.id;
    member.newMessages = 0;
    pubsub.pub('member:select', member);
    this.render();
  }

  selectUser(username) {
    const member = this.members.find(member => member.username === username);

    if (!member) { return; }

    this.selectMember(member.id);
  }

  async selectRoom(room) {
    const members = await getRoomMembers(room.id);

    this.members = members.map(member => ({
      ...member,
      isLoggedUser: member.username === this.user.username,
      lastVisit: Date.now(),
      newMessages: 0,
    }));
    this.selected = null;

    pubsub.pub('member:join', this.members );
    this.render();
  }

  handleNewMessage(memberName) {
    const member = this.members.find(member => member.username === memberName);

    if (!member) { return; }

    member.newMessages += 1;
    this.render();
  }


  async joinRoom(room) {
    this.members = await getRoomMembers(room.id);
    this.members = this.members.map(member => ({
      ...member,
      isLoggedUser: member.username === this.user.username,
      lastVisit: Date.now(),
      newMessages: 0,
    }));
    this.selected = null;

    pubsub.pub('member:join', this.members );
    this.render();
  }

  ioJoinRoom(user) {
    if (!this.members.find(item =>item.id === user.id)) {
      this.members.push({
        ...user,
        isLoggedUser: false,
        lastVisit: Date.now(),
      });
    }
    this.render();
    pubsub.pub('member:join', this.members);
  }

  ioLeaveRoom(user) {
    this.members = this.members.filter(member => member.username !== user.username);
    this.render();
    pubsub.pub('room:leave', this.members);
  }

  ioLogin(user) {
    this.user = user;
  }

  ioChangeStatus(user) {
    const idx = this.members.findIndex(member => member.id === user.id);
    const member = this.members[idx];

    this.members.splice(idx, 1);
    this.members.push({...member, ...user});

    this.render();
  }

  render() {
    this.members = this.members
      .map(member => ({ ...member, selected: member.id === this.selected }))
      .sort((a, b) => a.username.localeCompare(b.username))
      .sort((a, b) => +b.online - +a.online);
    this.elem.innerHTML = memberListTemplate({ members: this.members });
    this.setHandlers();
  }
}

export default MemberList;
