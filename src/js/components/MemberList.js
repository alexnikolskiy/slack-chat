import pubsub from 'Utils/pubsub';
import io from 'Utils/io';
import { getRoomMembers } from 'Utils/db';
import template from 'Templates/member-list';

class MemberList {
  constructor() {
    this.elem = document.querySelector('.chat-sidebar__members');
    this.members = [];
    this.selected = null;
    this.user = null;

    pubsub.sub('room:select', this.handleSelectRoom.bind(this));
    pubsub.sub('message:select-user', this.handleSelectUser.bind(this));
    pubsub.sub('message:new-private', this.handleNewMessage.bind(this));

    io.on('login', this.ioLogin.bind(this));
    io.on('room:join', this.ioJoinRoom.bind(this));
    io.on('room:leave', this.ioLeaveRoom.bind(this));
    io.on('online', this.ioChangeStatus.bind(this));
    io.on('offline', this.ioChangeStatus.bind(this));
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
    const member = this.members.find(m => m.id === id);
    pubsub.pub('member:select', member);

    this.members = this.members.map(m =>
      m.id !== id ? m : { ...m, lastVisit: Date.now(), newMessages: 0 },
    );
    this.selected = id;

    this.render();
  }

  handleSelectUser(username) {
    const member = this.members.find(m => m.username === username);

    if (!member) {
      return;
    }

    this.selectMember(member.id);
  }

  async handleSelectRoom(room) {
    const members = await getRoomMembers(room.id);

    this.members = members.map(member => ({
      ...member,
      isLoggedUser: member.id === this.user.id,
      lastVisit: Date.now(),
      newMessages: 0,
    }));
    this.selected = null;

    pubsub.pub('member:join', this.members);
    this.render();
  }

  handleNewMessage(memberName) {
    const member = this.members.find(m => m.username === memberName);

    if (!member) {
      return;
    }

    member.newMessages += 1;
    this.render();
  }

  ioJoinRoom(data) {
    if (this.members.find(member => member.id === data.user.id)) {
      return;
    }

    this.members = [
      ...this.members,
      {
        ...data.user,
        isLoggedUser: false,
        lastVisit: Date.now(),
      },
    ];

    this.render();
    pubsub.pub('member:join', this.members);
  }

  ioLeaveRoom(data) {
    this.members = this.members.filter(member => member.username !== data.user.username);
    this.render();
    pubsub.pub('room:leave', this.members);
  }

  ioLogin(user) {
    this.user = user;
  }

  ioChangeStatus(user) {
    this.members = this.members.map(member =>
      member.id !== user.id ? member : { ...member, ...user },
    );

    if (this.selected) {
      this.selectMember(this.selected);
    } else {
      this.render();
    }
  }

  render() {
    const members = this.members
      .map(member => ({ ...member, selected: member.id === this.selected }))
      .sort((a, b) => a.username.localeCompare(b.username))
      .sort((a, b) => +b.online - +a.online);
    this.elem.innerHTML = template({ members });
    this.setHandlers();
  }
}

export default MemberList;
