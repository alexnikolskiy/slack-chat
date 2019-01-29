class App {
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

  render() {
    for (let component of this.components) {
      component.render();
    }
  }
}

export default App;
