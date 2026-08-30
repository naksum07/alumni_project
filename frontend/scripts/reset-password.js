const formView    = document.getElementById('formView');
const invalidView = document.getElementById('invalidView');
const formMsg     = document.getElementById('formMessage');

function showMsg(el, text, isError) {
  el.textContent = text;
  el.classList.remove('hidden', 'text-red-600', 'text-green-600');
  el.classList.add(isError ? 'text-red-600' : 'text-green-600');
}

const params = new URLSearchParams(window.location.search);
const token  = params.get('token');

if (!token) {
  invalidView.classList.remove('hidden');
} else {
  formView.classList.remove('hidden');
}

document.getElementById('resetForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const newPassword = document.getElementById('newPassword').value;
  const confirm      = document.getElementById('confirmPassword').value;
  const btn          = document.getElementById('resetBtn');

  if (newPassword !== confirm) {
    showMsg(formMsg, 'Passwords do not match.', true);
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Resetting…';

  try {
    const res  = await fetch('/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      formView.classList.add('hidden');
      invalidView.classList.remove('hidden');
      return;
    }

    showMsg(formMsg, '✅ Password reset successfully! Redirecting to login…', false);
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);

  } catch (err) {
    console.error(err);
    showMsg(formMsg, 'Could not reach the server. Please try again.', true);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Reset Password';
  }
});