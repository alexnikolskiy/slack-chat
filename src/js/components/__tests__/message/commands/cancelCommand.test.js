import CancelCommand from '../../../message/commands/cancelCommand';
import Message from '../../../message';
import PubSub, { mockPub } from '../../../../lib/pubsub';
import generate from '../../../../../../utils/generate';

jest.mock('../../../../lib/pubsub');

test('should execute', () => {
  const text = `${generate.title()}\n`;
  const message = new Message({ pubsub: new PubSub(), text });
  const command = new CancelCommand(message);

  command.execute();
  expect(command.message).toMatchObject({ text: text.replace(/\r?\n/g, '<br>'), editing: false });
  expect(mockPub).toHaveBeenCalledWith('message:cancel', message);
});
