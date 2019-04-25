import roomsTemplate from 'Templates/room-list';
import * as roomService from '../services/room';
import store from '../store';
import Component from '../lib/component';

class RoomList extends Component {
  constructor(io, pubsub) {
    super({
      store,
      elem: document.querySelector('.chat-sidebar__rooms'),
    });

    this.state = {
      rooms: [],
      selected: null,
      joined: null,
      lastVisit: Date.now(),
    };

    this.io = io;
    this.pubsub = pubsub;

    this.selectRoom = this.selectRoom.bind(this);

    this.pubsub.sub('login', this.handleLogin.bind(this));
    this.pubsub.sub('member:select', this.handleSelectMember.bind(this));

    this.io.on('message:add', this.ioAddMessage.bind(this));
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

  selectRoom(roomId) {
    if (roomId === this.state.selected) {
      return;
    }

    const room = this.state.rooms.find(r => r.id === roomId);

    if (!room) {
      return;
    }

    let { joined } = this.state;

    if (joined !== roomId) {
      this.io.emit('editor:stop-typing');
      this.io.emit('room:join', room.id);
      joined = room.id;
    }

    this.setState({
      selected: roomId,
      lastVisit: Date.now(),
      rooms: [...this.state.rooms.filter(r => r.id !== room.id), { ...room, newMessages: 0 }],
      joined,
    });

    store.dispatch('selectRoom');
    this.pubsub.pub('room:select', room, this.state.lastVisit);
  }

  async handleLogin() {
    const { sender } = store.getState();
    const rooms = await roomService.getRooms();

    this.setState({
      rooms: rooms.map(room => ({
        ...room,
        newMessages: 0,
      })),
      joined: sender.room.id,
    });

    this.selectRoom(sender.room.id);
  }

  handleSelectMember() {
    this.setState({
      selected: null,
      lastVisit: Date.now(),
    });
  }

  ioAddMessage(message) {
    const { sender, receiver } = store.getState();
    const isPrivateMessage = !!message.receiver;

    if (sender.room.id !== message.room.id) {
      return;
    }

    if (receiver && !isPrivateMessage) {
      this.setState({
        rooms: this.state.rooms.map(room =>
          room.id !== message.room.id ? room : { ...room, newMessages: room.newMessages + 1 },
        ),
      });
    }
  }

  render() {
    const rooms = this.state.rooms
      .map(room => ({
        ...room,
        selected: room.id === this.state.selected,
        joined: room.id === this.state.joined,
      }))
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });

    this.elem.innerHTML = roomsTemplate({ rooms });
    this.setHandlers();
  }
}

export default RoomList;
