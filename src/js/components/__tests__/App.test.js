import App from '../App';

const mockRender = jest.fn();
const Component = jest.fn().mockImplementation(() => {
  return {
    render: mockRender,
  };
});
const component = new Component();
let app;

beforeEach(() => {
  app = new App();
});

afterEach(() => {
  app.clear();
});

test('should add component', () => {
  app.add(component);
  expect(app.components.has(component)).toBeTruthy();
});

test('should remove component', () => {
  app.add(component);
  app.remove(component);
  expect(app.components.size).toBe(0);
});

test('should clear', () => {
  app.add(component);
  app.clear();
  expect(app.components.size).toBe(0);
});

test('should render', () => {
  app.add(component);
  app.render();
  expect(mockRender).toHaveBeenCalled();
});
