import pubsub from 'Utils/pubsub';
import makeDialog from 'Utils/ui';

class DeleteCommand {
  constructor(message) {
    this.message = message;
  }

  execute() {
    const dialog = makeDialog({
      title: 'Delete message',
      content: 'Are you sure you want to delete this message? This cannot be undone.',
      cancel: true,
    });

    dialog.addFooterBtn('Delete', 'button button_medium button_danger margin-left', () => {
      dialog.destroy();
      pubsub.pub('message:delete', this.message);
    });

    dialog.show();
  }
}

export default DeleteCommand;
