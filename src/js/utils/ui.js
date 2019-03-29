import Dialog from '../components/Dialog';

export function makeDialog({ title = '', content = '', cancel = false, ok = false } = {}) {
  const dialog = new Dialog({ title });

  dialog.setContent(content);

  if (cancel) {
    dialog.addFooterBtn('Cancel', 'button button_medium', () => {
      dialog.destroy();
    });
  }

  if (ok) {
    dialog.addFooterBtn('OK', 'button button_medium button_primary', () => {
      dialog.destroy();
    });
  }

  return dialog;
}

export function getUserAvatar(user = null, size = 72) {
  if (user && user.avatar) {
    if (user.avatar.includes('http') || user.avatar.includes('avatars')) {
      return user.avatar;
    }

    return `avatars/${user.avatar}`;
  }

  return `https://api.adorable.io/avatars/${size}/${user.username}.png`;
}

export function autoExpand(input, ratio) {
  const maxHeight = Math.ceil(window.innerHeight / ratio);

  if (input.scrollHeight <= maxHeight - 20) {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }
}
