import Message from '../../message';
import EditCommand from '../../message/commands/editCommand';
import DeleteCommand from '../../message/commands/deleteCommand';
import SpeakCommand from '../../message/commands/speakCommand';

jest.unmock('../../message');
jest.mock('../../../lib/pubsub');
jest.mock('../../message/commands/editCommand');
jest.mock('../../message/commands/deleteCommand');
jest.mock('../../message/commands/speakCommand');

let message;

beforeEach(() => {
  message = new Message();
  EditCommand.mockClear();
  DeleteCommand.mockClear();
  SpeakCommand.mockClear();
});

test('should render actions', () => {
  const data = { isOwnMessage: true, isAutomated: false };
  let html = message.renderActions(data);

  expect(html.innerHTML).not.toHaveLength(0);
  expect(html.querySelectorAll('button')).toHaveLength(3);

  data.isOwnMessage = false;
  html = message.renderActions(data);
  expect(html.querySelectorAll('button')).toHaveLength(1);

  data.isAutomated = true;
  html = message.renderActions(data);
  expect(html.querySelectorAll('button')).toHaveLength(0);
});

test('should execute edit command on edit button click', () => {
  const btn = document.createElement('button');
  const ev = { target: { closest: () => btn } };

  btn.dataset.action = 'edit';
  message.handleActionButtonClick(ev);
  expect(EditCommand).toHaveBeenCalled();
});

test('should execute delete command on delete button click', () => {
  const btn = document.createElement('button');
  const ev = { target: { closest: () => btn } };

  btn.dataset.action = 'delete';
  message.handleActionButtonClick(ev);
  expect(DeleteCommand).toHaveBeenCalled();
});

test('should execute speak command on speak button click', () => {
  const btn = document.createElement('button');
  const ev = { target: { closest: () => btn } };

  btn.dataset.action = 'speak';
  message.handleActionButtonClick(ev);
  expect(SpeakCommand).toHaveBeenCalled();
});

test('should not execute any command if no one button was clicked', () => {
  const ev = { target: { closest: () => null } };

  message.handleActionButtonClick(ev);

  expect(EditCommand).not.toHaveBeenCalled();
  expect(DeleteCommand).not.toHaveBeenCalled();
  expect(SpeakCommand).not.toHaveBeenCalled();
});

test('should throw an error on unknown action', () => {
  const btn = document.createElement('button');
  const ev = { target: { closest: () => btn } };

  btn.dataset.action = '';
  expect(() => message.handleActionButtonClick(ev)).toThrow('Unknown command');
});

test('should render', () => {
  const mockOutput = jest.fn();
  const implementor = {
    output: mockOutput,
  };

  message.render(implementor);
  expect(mockOutput).toHaveBeenCalled();
});
