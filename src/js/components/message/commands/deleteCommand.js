import pubsub from 'Utils/pubsub';

class DeleteCommand {
  constructor(message) {
    this.message = message;
  }

  execute() {
    let result = confirm('Are you sure?');

    if (result) {
      this.message.deleted = true;
      pubsub.pub('message:delete', this.message);
    }
  }
}

export default DeleteCommand;
