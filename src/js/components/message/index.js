import { getUserAvatar } from 'Utils/ui';
import { htmlToElement } from 'Utils/helpers';
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
    // avatar = null,
    hasChanges = false,
    rendered = false,
    pubsub = null,
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
    // this.avatar = getUserAvatar(
    //   { ...this.sender, avatar: (this.sender && this.sender.avatar) || avatar },
    //   72,
    // );
    this.pubsub = pubsub;
    this.handleActionButtonClick = this.handleActionButtonClick.bind(this);
  }

  get avatar() {
    // return getUserAvatar({ ...this.sender, avatar: this.sender && this.sender.avatar }, 72);
    return getUserAvatar(this.sender, 72);
  }

  renderActions(data) {
    const html = htmlToElement(templateActions(data));

    html.addEventListener('click', this.handleActionButtonClick);

    return html;
  }

  handleActionButtonClick(ev) {
    const btn = ev.target.closest('button');

    if (!btn) {
      return;
    }

    const { action } = btn.dataset;
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
        throw new Error('Unknown command');
    }

    command.execute();
  }

  render(implementor) {
    return implementor.output(new Message(this));
  }
}

export default Message;
