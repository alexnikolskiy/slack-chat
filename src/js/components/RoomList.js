import pubsub from 'Utils/pubsub';
import io from 'Utils/io';
import { getRooms } from 'Utils/helpers';
import roomsTemplate from 'Templates/room-list';

class RoomList {
  constructor() {
    this.elem = document.querySelector('.chat-sidebar__rooms');
    this.rooms = [];
    this.selected = null;
    this.joined = null;
    this.lastVisit = Date.now();

    this.loadRooms();

    this.selectRoom = this.selectRoom.bind(this);

    pubsub.sub('member:select', this.selectMember.bind(this));
    pubsub.sub('message:new', this.handleNewMessage.bind(this));

    io.on('login', this.ioLogin.bind(this));
  }

  async loadRooms() {
    const rooms = await getRooms();

    this.rooms = rooms.map(room => ({
      ...room,
      newMessages: 0,
    }));

    this.onSelectRoom();
  }

  setHandlers() {
    const links = this.elem.querySelectorAll('.listitem__link');

    [...links].forEach(link => {
      link.addEventListener('click', ev => {
        ev.preventDefault();

        this.selectRoom(ev.currentTarget.dataset.id);
      });
    });
  }

  selectRoom(id) {
    if (id === this.selected) {
      return;
    }
    this.selected = id;

    this.onSelectRoom(id);
  }

  selectMember() {
    this.selected = null;
    this.lastVisit = Date.now();
    this.render();
  }

  ioLogin(user) {
    this.joined = user.room;
    this.selectRoom(user.room);
  }

  onSelectRoom() {
    const room = this.rooms.find(r => r.id === this.selected);

    if (!room) {
      return;
    }

    pubsub.pub('room:select', room, this.lastVisit);

    this.lastVisit = Date.now();
    room.newMessages = 0;

    if (this.joined !== this.selected) {
      io.emit('room:join', room.id);
      this.joined = room.id;
    } else {
      pubsub.pub('room:join', room, this.lastVisit);
    }
    this.render();
  }

  handleNewMessage(roomId) {
    const room = this.rooms.find(r => r.id === roomId);

    room.newMessages += 1;
    this.render();
  }

  render() {
    const rooms = this.rooms.map(room => ({
      ...room,
      selected: room.id === this.selected,
      joined: room.id === this.joined,
    }));

    this.elem.innerHTML = roomsTemplate({ rooms });
    this.setHandlers();
  }
}

export default RoomList;
