import SpeakCommand from '../../../message/commands/speakCommand';
import Message from '../../../message';

const mockSpeak = jest.fn();
window.speechSynthesis = {
  speak: mockSpeak,
};

const SpeechSynthesisUtterance = jest.fn();
window.SpeechSynthesisUtterance = SpeechSynthesisUtterance;

test('should execute', () => {
  const message = new Message();
  const command = new SpeakCommand(message);

  command.execute();
  expect(SpeechSynthesisUtterance).toHaveBeenCalled();
  expect(mockSpeak).toHaveBeenCalled();
});
