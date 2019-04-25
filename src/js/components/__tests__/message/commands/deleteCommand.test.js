import DeleteCommand from '../../../message/commands/deleteCommand';
import Message from '../../../message';
import PubSub, { mockPub } from '../../../../lib/pubsub';
import Dialog, {
  mockShow as mockDialogShow,
  mockDestroy as mockDialogDestroy,
} from '../../../Dialog';

jest.mock('../../../../lib/pubsub');
jest.mock('../../../Dialog');

test('should execute', () => {
  const message = new Message({ pubsub: new PubSub() });
  const command = new DeleteCommand(message);

  command.execute();
  expect(mockDialogShow).toHaveBeenCalled();
});

test('should delete on button click', () => {
  const message = new Message({ pubsub: new PubSub() });
  const command = new DeleteCommand(message);
  const dialog = new Dialog();

  command.handleDeleteClick(dialog);
  expect(mockDialogDestroy).toHaveBeenCalled();
  expect(mockPub).toHaveBeenCalledWith('message:delete', message);
});
