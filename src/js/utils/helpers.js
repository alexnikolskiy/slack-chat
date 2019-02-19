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

export function getUserAvatar(user = null, size = 72) {
  if (user && user.avatar) {
    if (user.avatar.includes('http') || user.avatar.includes('avatars')) {
      return user.avatar;
    }

    return `avatars/${user.avatar}`;
  }

  return `https://api.adorable.io/avatars/${size}/${user.username}.png`;
}
