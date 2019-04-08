import Modal from '../Modal';
import generate from '../../../../utils/generate';

jest.unmock('../Modal');

let modal;

beforeEach(() => {
  modal = new Modal({ header: true, footer: true, title: generate.title() });
});

afterEach(() => {
  if (modal.elem) {
    modal.destroy();
  }
});

test('should close on btn close click', () => {
  const btnClose = modal.elem.querySelector('.modal__close');
  const mockDestroy = jest.spyOn(modal, 'destroy');

  btnClose.click();
  expect(mockDestroy).toHaveBeenCalled();
  mockDestroy.mockRestore();
});

test('should close on esc key', () => {
  const event = new KeyboardEvent('keydown', { keyCode: 27 });
  const mockDestroy = jest.spyOn(modal, 'destroy');

  document.dispatchEvent(event);
  expect(mockDestroy).toHaveBeenCalled();
  mockDestroy.mockRestore();
});

test('should open', () => {
  modal.open();
  expect(modal.elem.style.display).toBe('block');
});

test('should close', () => {
  modal.close();
  expect(modal.elem.style.display).toBe('none');
});

test('should destroy', () => {
  modal.destroy();
  expect(modal.elem).toBeNull();
  expect(document.querySelector('.modal')).toBeNull();
});

test('should get content', () => {
  const elem = modal.getContent();
  expect(elem).toBeDefined();
  expect(elem.className).toMatch('modal__content');
});

test('should set content', () => {
  const body = modal.elem.querySelector('.modal__content');
  const content = generate.title();

  modal.setContent(content);
  expect(body.innerHTML).not.toHaveLength(0);
  expect(body.innerHTML).toMatch(content);
});

test('should add footer btn', () => {
  const footer = modal.elem.querySelector('.modal__footer');
  const label = 'OK';
  const className = 'primary';
  const cb = jest.fn();

  modal.addFooterBtn(label, className, cb);
  const btn = footer.querySelector('button');
  expect(btn).not.toBeNull();
  expect(btn.innerText).toBe(label);
  expect(btn.className).toMatch(className);

  btn.click();
  expect(cb).toHaveBeenCalled();
});
