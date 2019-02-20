document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.login-page__form');
  const fields = document.querySelectorAll('.login-page__input');
  const links = document.querySelectorAll('.login-page__link');

  async function onSubmit(ev) {
    ev.preventDefault();

    const { action: url, method } = ev.target;
    const form = ev.target;
    let data;
    let errors = {};

    try {
      const response = await fetch(url, {
        body: new FormData(form),
        credentials: 'same-origin',
        method,
      });

      data = await response.json();

      if (data.error) {
        errors = data.error;
      }
    } catch (err) {
      errors.username = err.message;
    }

    if ((data && data.success) || Object.keys(errors).length === 0) {
      let loc = url.replace('.', '');

      loc = window.location.pathname.replace(loc, '');
      window.location.href = loc;
      return;
    }

    Object.keys(errors).forEach(name => {
      const parent = form.elements[name].parentElement;

      parent.classList.add('error');
      parent.dataset.error = errors[name];
    });
  }

  [...fields].forEach(field =>
    field.addEventListener('focus', ev => {
      ev.target.parentElement.classList.remove('error');
    }),
  );

  [...links].forEach(link =>
    link.addEventListener('click', ev => {
      ev.preventDefault();
      ev.target
        .closest('.login-page__form-wrapper')
        .classList.toggle('login-page__form-wrapper_flipped');
    }),
  );

  [...forms].forEach(form => form.addEventListener('submit', onSubmit));
});
