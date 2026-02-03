import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCZSyty8XgrkBycReUHXzZZJgvajJMatJQ",
  authDomain: "updaze-jobs.firebaseapp.com",
  projectId: "updaze-jobs",
  messagingSenderId: "208744900105",
  appId: "1:208744900105:web:84456f914b2ae57ee7fad8",
  measurementId: "G-WM1KXZD6DL"
};

const app = initializeApp(firebaseConfig);

// ✅ EXPORT db ONCE
export const db = getFirestore(app);
export const auth = getAuth(app);

(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();
