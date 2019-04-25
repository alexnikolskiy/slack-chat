import MessageOutput from '../../../message/output/messageOutput';
import Message from '../../../message';
import PubSub, { mockPub } from '../../../../lib/pubsub';
import generate from '../../../../../../utils/generate';

jest.mock('../../../../lib/pubsub');

test('should output', () => {
  const message = new Message({ pubsub: new PubSub(), timestamp: 1553251677 });
  const messageOutput = new MessageOutput();
  const formatTime = '11:27 PM';

  messageOutput.output(message);
  expect(messageOutput.message.time).toBe(formatTime);
  expect(messageOutput.elem).not.toBeNull();
  expect(messageOutput.elem.innerHTML).not.toHaveLength(0);
});

test('should handle click on user', () => {
  const message = new Message({ pubsub: new PubSub(), sender: generate.userData() });
  const messageOutput = new MessageOutput();
  const ev = { preventDefault: () => {} };

  messageOutput.message = message;
  messageOutput.handleUserClick(ev);
  expect(mockPub).toHaveBeenCalledWith('message:select-user', message.sender.username);
});
