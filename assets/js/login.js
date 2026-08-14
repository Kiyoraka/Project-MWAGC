/* ==========================================================================
   Getta Coffee - Login

   HARDCODED MOCKUP. There is no authentication here and none is intended:
   any non-empty email and password are accepted, and the "session" is a flag
   in sessionStorage so admin.html has something to check. Nothing is sent
   anywhere, nothing is verified, no credential is ever stored.

   Replace this whole file when the Spring Boot API lands.
   ========================================================================== */

(function () {
  'use strict';

  var SESSION_KEY = 'getta_admin_session';

  var form     = document.getElementById('login-form');
  var email    = document.getElementById('email');
  var password = document.getElementById('password');
  var errorBox = document.getElementById('error');
  var reveal   = document.getElementById('reveal');

  /* --- password reveal ---------------------------------------------------- */

  reveal.addEventListener('click', function () {
    var hidden = password.type === 'password';
    password.type = hidden ? 'text' : 'password';
    reveal.textContent = hidden ? 'Hide' : 'Show';
    reveal.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
    password.focus();
  });

  /* --- validation feedback ------------------------------------------------ */

  function showError(message, field) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    if (field) {
      field.classList.add('is-invalid');
      field.focus();
    }
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
    email.classList.remove('is-invalid');
    password.classList.remove('is-invalid');
  }

  email.addEventListener('input', clearError);
  password.addEventListener('input', clearError);

  /* --- submit ------------------------------------------------------------- */

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var user = email.value.trim();
    var pass = password.value;

    if (!user) {
      showError('Please enter your email to sign in.', email);
      return;
    }

    if (!pass) {
      showError('Please enter your password to sign in.', password);
      return;
    }

    // Any credentials pass - this is a demo, not a login.
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      email: user,
      name: 'Nurul Huda',
      role: 'Ops Manager',
      signedInAt: new Date().toISOString()
    }));

    window.location.href = 'admin.html';
  });

  /* Already signed in this tab? Go straight through. */
  if (sessionStorage.getItem(SESSION_KEY)) {
    window.location.replace('admin.html');
  }
}());
