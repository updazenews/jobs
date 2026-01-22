const form = document.getElementById('loginForm');
const errorBox = document.getElementById('error');
const loginBtn = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorBox.classList.add('d-none');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  const formData = new FormData(form);

  try {
    const response = await fetch('https://api.updaze.co.za/api/job/login.php', {
      method: 'POST',
      body: new URLSearchParams(formData)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }

    // OPTIONAL (later): store auth token
    // localStorage.setItem('admin_user', JSON.stringify(result.user));

    // Redirect to admin dashboard
    window.location.href = '/admin/dashboard.html';

  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove('d-none');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});
