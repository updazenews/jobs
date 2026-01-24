import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-admin.js";
import { auth } from "/assets/js/jobs.js";

const tbUsers = document.getElementById('tbUsers');

document.addEventListener("DOMContentLoaded", async () => {

    signInWithEmailAndPassword.getAuth().getUsers(auth).then((getUsersResult) => {
        console.log('Successfully fetched user data:');
        getUsersResult.users.forEach((userRecord) => {
          console.log(userRecord);
        });
      });
});