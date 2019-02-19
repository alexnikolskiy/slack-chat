import Chat from './components/Chat';
import User from './components/User';
import RoomList from './components/RoomList';
import MemberList from './components/MemberList';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import Editor from './components/Editor';
import NotificationBar from './components/NotificationBar';

const app = new Chat();

app
  .add(new User())
  .add(new RoomList())
  .add(new MemberList())
  .add(new ChatHeader())
  .add(new MessageList())
  .add(new Editor())
  .add(new NotificationBar())
  .render();
