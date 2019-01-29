import templateActions from 'Templates/message-actions';
import EditCommand from './commands/editCommand';
import DeleteCommand from './commands/deleteCommand';
import SpeakCommand from './commands/speakCommand';

class Message {
  constructor({
    id,
    sender = null,
    receiver = null,
    text = '',
    timestamp = Date.now(),
    room = null,
    automated = false,
    edited = false,
    read = false,
    avatar = null,
  } = {}) {
    this.elem = null;
    this.id = id;
    this.sender = sender;
    this.receiver = receiver;
    this.text = text;
    this.timestamp = timestamp;
    this.room = room;
    this.automated = automated;
    this.edited = edited;
    this.read = read;
    this.rendered = false;
    this.editing = false;
    this.hasChanges = false;
    this.deleted = false;
    this.avatar = avatar ? avatar : `https://api.adorable.io/avatars/72/${this.sender}.png`;
  }

  renderActions(data) {
    const html = templateActions(data);
    const div = document.createElement('div');

    div.innerHTML = html;
    this.setActionsHandlers(div.firstElementChild);

    return div.firstElementChild;
  }

  setActionsHandlers(elem) {
    elem.addEventListener('click', (ev) => {
      const button = ev.target.closest('.message__action');

      if (!button) { return; }

      const action = button.dataset.action;
      let command;

      switch (action) {
        case 'edit':
          command = new EditCommand(this);
          break;
        case 'delete':
          command = new DeleteCommand(this);
          break;
        case 'speak':
          command = new SpeakCommand(this);
          break;
      }

      command.execute();
    });
  }

  render(implementor) {
    return implementor.output(this);
  }
}

export default Message;
