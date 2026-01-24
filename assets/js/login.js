import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { auth } from "./jobs.js";

const form = document.getElementById('loginForm');
const emailB = document.getElementById('usernameBox');
const passwordB = document.getElementById('passwordBox');
const errorBox = document.getElementById('error');
const loginBtn = document.getElementById('loginBtn');
const loadingBtn = document.getElementById('loadingBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  errorBox.classList.add('d-none');
  loginBtn.style.display = 'none';
  loadingBtn.style.display = 'inline-block';
  loginBtn.disabled = true;

  const formData = new FormData(form);
  const email = emailB.value;
  const password = passwordB.value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    console.log('Logged in user:', user);

    // Optional: store session
    localStorage.setItem('admin_user', JSON.stringify({
      uid: user.uid,
      email: user.email
    }));

    // Redirect after login
    // window.location.href = "/admin/dashboard.html";

  } catch (err) {
    console.error('Login Error:', err);
    errorBox.textContent = err.message;
    errorBox.classList.remove('d-none');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});
