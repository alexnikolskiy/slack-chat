import ioClient from './lib/io';
import PubSub from './lib/pubsub';
import App from './components/App';
import User from './components/User';
import RoomList from './components/RoomList';
import MemberList from './components/MemberList';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import Editor from './components/Editor';
import NotificationBar from './components/NotificationBar';

const io = ioClient();
const pubsub = new PubSub();
const app = new App();

app
  .add(new User(io, pubsub))
  .add(new RoomList(io, pubsub))
  .add(new MemberList(io, pubsub))
  .add(new ChatHeader(io, pubsub))
  .add(new MessageList(io, pubsub))
  .add(new Editor(io, pubsub))
  .add(new NotificationBar(io, pubsub))
  .render();
