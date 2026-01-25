import { db} from "/assets/js/jobs.js";
import { auth } from "/jobs.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    auth = getAuth();
    signOut(auth).then(() => {
        window.location.href = "/login";
    }).catch((error) => {
        // An error happened.
    });
});