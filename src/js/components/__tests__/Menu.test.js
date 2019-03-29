import Menu from '../Menu';
import generate from '../../../../utils/generate';

jest.unmock('../Menu');

let menu;

beforeEach(() => {
  menu = new Menu(document.body);
});

afterEach(() => {
  if (menu.elem) {
    menu.destroy();
  }
});

test('should close on click outside', () => {
  const mask = menu.elem.querySelector('.popover_mask');
  const mockDestroy = jest.spyOn(menu, 'destroy');

  mask.click();
  expect(mockDestroy).toHaveBeenCalled();
  mockDestroy.mockRestore();
});

test('should close on esc key', () => {
  const event = new KeyboardEvent('keydown', { keyCode: 27 });
  const mockDestroy = jest.spyOn(menu, 'destroy');

  document.dispatchEvent(event);
  expect(mockDestroy).toHaveBeenCalled();
  mockDestroy.mockRestore();
});

test('should add menu item', () => {
  const text = generate.title();
  const cssClass = 'active';
  const cb = jest.fn();
  const mockDestroy = jest.spyOn(menu, 'destroy');

  menu.add(text, cssClass, cb);

  const item = menu.list.querySelector('li.menu__item');
  const link = item.querySelector('a.menu__link');

  expect(item.className).toMatch(cssClass);
  expect(link.textContent).toBe(text);
  expect(menu.items.has(text)).toBeTruthy();
  link.click();
  expect(mockDestroy).toHaveBeenCalled();
  expect(cb).toHaveBeenCalled();
  mockDestroy.mockRestore();
});

test('should remove menu item', () => {
  const text = generate.title();
  const cssClass = 'active';
  const cb = jest.fn();

  menu.add(text, cssClass, cb);
  menu.remove(text);
  expect(menu.list.innerHTML).toHaveLength(0);
  expect(menu.items.has(text)).not.toBeTruthy();
});

test('should clear menu items', () => {
  const text = generate.title();
  const cssClass = 'active';
  const cb = jest.fn();

  menu.add(text, cssClass, cb);
  menu.clear();

  expect(menu.list.innerHTML).toHaveLength(0);
  expect(menu.items.size).toBe(0);
});

test('should show', () => {
  menu.show();
  expect(menu.elem.style.opacity).toBe('1');
});

test('should hide', () => {
  menu.hide();
  expect(menu.elem.style.opacity).toBe('0');
  expect(menu.target.className).not.toMatch('active');
});

test('should destroy', () => {
  menu.destroy();
  expect(menu.elem).toBeNull();
  expect(document.querySelector('.menu')).toBeNull();
  expect(menu.target.className).not.toMatch('active');
});
