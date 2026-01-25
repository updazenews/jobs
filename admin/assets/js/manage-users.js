import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../../../assets/js/jobs.js";
import { createUserWithEmailAndPassword, getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
//import {  } from "../../../assets/js/jobs.js";

document.addEventListener("DOMContentLoaded", async () => {

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
    
      
    }else{
      window.location.href = "../../admin/logout";
    }
  } else {
    window.location.href = "../../admin/logout";
  }

  const usersContainer = document.getElementById("tbUsers");

  try {

    const usersFer = collection(db, "users");
    const q = query(
      usersFer,
      orderBy("Full Name", "asc")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      usersContainer.innerHTML = `
      <thead>
        <tr>
                <th scope="col">#</th>
                <th scope="col">Full Name</th>
                <th scope="col">Email Address</th>
                <th scope="col">Header</th>
                <th scope="col">Header</th>
            </tr>
        </thead>
        <tbody>
          <div class="col-12 text-center text-muted">
            No job postings available at the moment.
          </div>
        <tbody>
        
      `;
      return;
    }
    const users = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        fullName: data["Full Name"],
        email: doc.id,
        header: data["role"],
        uid: doc.id
      };
    });

    renderUsers(users);


  } catch (error) {
    console.error(error);
  }

  // 🔽 YOUR EXISTING RENDERER (UNCHANGED)
  function renderUsers(users) {
    usersContainer.innerHTML = "<table class=\"table table-striped table-sm\" id=\"tbUsers\"> <thead> <tr> <th scope=\"col\">Full Name</th> <th scope=\"col\">Email Address</th> <th scope=\"col\">Role</th> <th scope=\"col\">Header</th> </tr> </thead>";
    users.forEach(user => {
      const row = `
        <tr>
          <td>${user.fullName}</td>
          <td>${user.email}</td>
          <td>${user.header}</td>
          <td><button class="btn btn-danger" onclick="deleteUser('${user.uid}')">Suspend</button></td>
        </tr>
      `;
      usersContainer.innerHTML += row;
    });

    usersContainer.innerHTML += "</tbody> </table>";

  }
  const btnSave = document.getElementById('btnSave');
  const fullName = document.getElementById('fullName');
  const uEmail = document.getElementById('uEmail');
  const uPassword = document.getElementById('uPassword');
  const cPassword = document.getElementById('cPassword');

  btnSave.addEventListener('click', () => {
    btnSave.disabled = true;
    btnSave.innerHTML = "<div class=\"spinner-border\" role=\"status\"><span class=\"visually-hidden\">Loading...</span></div>";
    if (uPassword.value !== cPassword.value) {
      alert("Passwords do not match!");
      return;
    }

    createUserWithEmailAndPassword(auth, uEmail.value, uPassword.value)
      .then((userCredential) => {
        
        try {
          setDoc(doc(db, "users", userCredential.user.email),{
            "Full Name": fullName.value,
            "role": "data Capturer"
          }).then(() => {
            console.log('User created:', userCredential.user.uid);
            location.reload();
          });
          
        } catch (error) {
          
          console.error("Error creating user: ", error);
        }        
  });
});
})
