import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, auth } from "assets/js/jobs.js";
import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const form = document.getElementById('loginForm');
const emailB = document.getElementById('usernameBox');
const passwordB = document.getElementById('passwordBox');
const errorBox = document.getElementById('error');
const loginBtn = document.getElementById('loginBtn');
const loadingBtn = document.getElementById('loadingBtn');

document.addEventListener('DOMContentLoaded', async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const userVer = collection(db, "users");
      const q = query(
        userVer,
        where("email", "==", user.email)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => {
          return {role: data["role"]};
      });
      
  
      if (users[0].role === "administrator"){
      
        window.location.href = "/admin/";
      }
    }

});

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

    if (user.email != null) {
       //Redirect after login
      window.location.href = "/admin/";
    }
   

  } catch (err) {
    console.error('Login Error:', err);
    errorBox.textContent = err.message;
    errorBox.classList.remove('d-none');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});
