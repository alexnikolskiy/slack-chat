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
    this.components.forEach(component => {
      component.render();
    });
  }
}

export default App;
