const requestView = document.getElementById('requestView');
const sentView    = document.getElementById('sentView');
const requestMsg  = document.getElementById('requestMessage');

function showMsg(el, text, isError) {
  el.textContent = text;
  el.classList.remove('hidden', 'text-red-600', 'text-green-600');
  el.classList.add(isError ? 'text-red-600' : 'text-green-600');
  if (typeof showPopup === 'function') {
    showPopup(text, isError ? 'error' : 'success');
  }
}

async function requestResetLink(email) {
  const res  = await fetch('/api/auth/forgot-password', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

document.getElementById('forgotForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('forgotEmail').value.trim();
  const btn   = document.getElementById('forgotBtn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const { ok, data } = await requestResetLink(email);

    if (!ok) {
      showMsg(requestMsg, data.message || 'Something went wrong.', true);
      return;
    }

    // Always show the same generic "check your email" view
    requestView.classList.add('hidden');
    sentView.classList.remove('hidden');


  } catch (err) {
    console.error(err);
    showMsg(requestMsg, 'Could not reach the server. Please try again.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Reset Link';
  }
});

document.getElementById('resendBtn').addEventListener('click', function () {
  sentView.classList.add('hidden');
  requestView.classList.remove('hidden');
  requestMsg.classList.add('hidden');
});