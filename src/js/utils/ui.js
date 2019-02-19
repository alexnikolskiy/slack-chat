import Dialog from '../components/Dialog';

export default function makeDialog({ title = '', content = '', cancel = false, ok = false } = {}) {
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
