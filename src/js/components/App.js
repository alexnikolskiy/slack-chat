export default class App {
  constructor() {
    this.components = new Set();
  }

  add(component) {
    this.components.add(component);

    return this;
  }

  remove(component) {
    this.components.delete(component);

    return this;
  }

  clear() {
    this.components.clear();
  }

  render() {
    this.components.forEach(component => {
      component.render();
    });
  }
}
