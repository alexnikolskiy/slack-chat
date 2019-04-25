import Dialog from '../Dialog';
import generate from '../../../../utils/generate';

jest.unmock('../Dialog');

let dialog;
const title = generate.title();

beforeEach(() => {
  dialog = new Dialog({ title });
});

afterEach(() => {
  if (dialog.elem) {
    dialog.destroy();
  }
});

test('`elem` property should be defined during `Dialog` class instantiation', () => {
  expect(dialog.elem).toBeDefined();
});

test('should set default title during `Dialog` class instantiation', () => {
  const testDialog = new Dialog();
  expect(testDialog.title).toHaveLength(0);
  testDialog.destroy();
});

test('should show', () => {
  dialog.show();
  expect(dialog.elem.className).toMatch('dialog_open');
});

test('should hide', () => {
  dialog.elem.className = 'dialog_open';
  dialog.hide();
  expect(dialog.elem.className).not.toMatch('dialog_open');
});

test('should destroy', () => {
  dialog.destroy();
  expect(dialog.elem).toBeNull();
  expect(document.querySelector('.dialog')).toBeNull();
});

test('should close on btn close click', () => {
  const btnClose = dialog.elem.querySelector('.dialog__close');
  const mockDestroy = jest.spyOn(dialog, 'destroy');

  btnClose.click();
  expect(mockDestroy).toHaveBeenCalled();
  mockDestroy.mockRestore();
});

test('should close on esc key', () => {
  const event = new KeyboardEvent('keydown', { keyCode: 27 });
  const mockDestroy = jest.spyOn(dialog, 'destroy');

  document.dispatchEvent(event);
  expect(mockDestroy).toHaveBeenCalled();
  mockDestroy.mockRestore();
});

test('should set content', () => {
  const body = dialog.elem.querySelector('.dialog__body');
  const content = generate.title();

  dialog.setContent(content);
  expect(body.innerHTML).not.toHaveLength(0);
  expect(body.innerHTML).toMatch(content);
});

test('should add footer btn', () => {
  const footer = dialog.elem.querySelector('.dialog__footer');
  const label = 'OK';
  const className = 'primary';
  const cb = jest.fn();

  dialog.addFooterBtn(label, className, cb);
  const btn = footer.querySelector('button');
  expect(btn).not.toBeNull();
  expect(btn.innerText).toBe(label);
  expect(btn.className).toMatch(className);

  btn.click();
  expect(cb).toHaveBeenCalled();
});
