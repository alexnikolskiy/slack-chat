document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.login-page__form');
  const fields = document.querySelectorAll('.login-page__input');
  const links = document.querySelectorAll('.login-page__link');

  async function onSubmit(ev) {
    ev.preventDefault();

    const { action: url, method } = ev.target;
    const form = ev.target;
    const formData = new URLSearchParams(new FormData(form));

    const response = await fetch(url, {
      body: formData,
      method,
    });

    const data = await response.json();

    if (!data || data.success || !data.error) {
      let loc = url.replace('.', '');

      loc = window.location.pathname.replace(loc, '');
      window.location.href = loc;
      return;
    }

    const errors = Object.keys(data.error);
    errors.forEach(name => {
      const parent = form.elements[name].parentElement;

      parent.classList.add('error');
      parent.dataset.error = data.error[name];
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
