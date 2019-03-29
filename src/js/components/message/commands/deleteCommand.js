import { makeDialog } from 'Utils/ui';

class DeleteCommand {
  constructor(message) {
    this.message = message;
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }

  execute() {
    const dialog = makeDialog({
      title: 'Delete message',
      content: 'Are you sure you want to delete this message? This cannot be undone.',
      cancel: true,
    });

    dialog.addFooterBtn('Delete', 'button button_medium button_danger margin-left', () =>
      this.handleDeleteClick(dialog),
    );

    dialog.show();
  }

  handleDeleteClick(dialog) {
    dialog.destroy();
    this.message.pubsub.pub('message:delete', this.message);
  }
}

export default DeleteCommand;
