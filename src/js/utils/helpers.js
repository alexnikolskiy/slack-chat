export const throttle = (fn, delay) => {
  let lastTime;

  return function throttled(...args) {
    const timeSinceLastExecution = Date.now() - lastTime;

    if (!lastTime || timeSinceLastExecution >= delay) {
      fn.apply(this, args);
      lastTime = Date.now();
    }
  };
};

export const debounce = (fn, delay) => {
  let timer;

  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

export const htmlToElement = html => {
  const template = document.createElement('template');

  template.innerHTML = html.trim();

  return template.content.firstChild;
};
