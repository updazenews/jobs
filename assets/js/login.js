const form = document.getElementById('loginForm');
const errorBox = document.getElementById('error');
const loginBtn = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorBox.classList.add('d-none');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  // Get form values
  const formData = new FormData(form);
  const email = formData.get('email');       
  const password = formData.get('password'); 

  try {
    const response = await fetch('https://api-updaze.yzz.me/api/jobs/login.php', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    // Log the full response in the console
    console.log('Login API Response:', result);

    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }

    // OPTIONAL: store auth token
    // localStorage.setItem('admin_user', JSON.stringify(result.user));

    // Redirect to admin dashboard
    window.location.href = '/admin/dashboard.html';

  } catch (err) {
    console.error('Login Error:', err); // log error details in console
    errorBox.textContent = err.message;
    errorBox.classList.remove('d-none');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});
