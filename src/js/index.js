import App from './components/App';
import RoomList from './components/RoomList';
import ChatHeader from './components/ChatHeader';
import MemberList from './components/MemberList';
import Chat from './components/Chat';
import Editor from './components/Editor';
import NotificationBar from './components/NotificationBar';
import User from './components/User';

const app = new App();

app
  .add(new User())
  .add(new RoomList())
  .add(new MemberList())
  .add(new ChatHeader())
  .add(new Chat())
  .add(new Editor())
  .add(new NotificationBar())
  .render();
