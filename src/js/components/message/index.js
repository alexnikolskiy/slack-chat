import { getUserAvatar } from 'Utils/helpers';
import templateActions from 'Templates/message-actions';
import EditCommand from './commands/editCommand';
import DeleteCommand from './commands/deleteCommand';
import SpeakCommand from './commands/speakCommand';

class Message {
  constructor({
    id,
    elem = null,
    sender = null,
    receiver = null,
    text = '',
    timestamp = Date.now(),
    room = null,
    automated = false,
    editing = false,
    edited = false,
    read = false,
    avatar = null,
    hasChanges = false,
    rendered = false,
  } = {}) {
    this.id = id;
    this.elem = elem;
    this.sender = sender;
    this.receiver = receiver;
    this.text = text;
    this.timestamp = timestamp;
    this.room = room;
    this.automated = automated;
    this.editing = editing;
    this.edited = edited;
    this.read = read;
    this.hasChanges = hasChanges;
    this.rendered = rendered;
    this.avatar = getUserAvatar({ username: sender, avatar }, 72);
  }

  renderActions(data) {
    const html = templateActions(data);
    const div = document.createElement('div');

    div.innerHTML = html;
    this.setActionsHandlers(div.firstElementChild);

    return div.firstElementChild;
  }

  setActionsHandlers(elem) {
    elem.addEventListener('click', ev => {
      const button = ev.target.closest('.message__action');

      if (!button) {
        return;
      }

      const { action } = button.dataset;
      let command;

      switch (action) {
        case 'edit':
          command = new EditCommand(new Message(this));
          break;
        case 'delete':
          command = new DeleteCommand(new Message(this));
          break;
        case 'speak':
          command = new SpeakCommand(new Message(this));
          break;
        default:
          break;
      }

      command.execute();
    });
  }

  render(implementor) {
    return implementor.output(new Message(this));
  }
}

export default Message;
