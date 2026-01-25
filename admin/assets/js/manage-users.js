import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../../../assets/js/jobs.js";

document.addEventListener("DOMContentLoaded", async () => {
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
  function renderUsers(users){
    usersContainer.innerHTML = "<table class=\"table table-striped table-sm\" id=\"tbUsers\"> <thead> <tr> <th scope=\"col\">#</th> <th scope=\"col\">Full Name</th> <th scope=\"col\">Email Address</th> <th scope=\"col\">Header</th> </tr> </thead>" ;
    users.forEach(user => {
      const row = `
        <tr>
          <td>${user.fullName}</td>
          <td>${user.email}</td>
          <td>${user.header}</td>
          <td><button class="btn btn-danger" onclick="deleteUser('${user.uid}')">Delete</button></td>
        </tr>
      `;
      usersContainer.innerHTML += row;
    });

    usersContainer.innerHTML += "</tbody> </table>";

  }
});