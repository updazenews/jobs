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
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {

  //Check if the user is authorised to access this page.
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {

    
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userVer = collection(db, "users");
      const q = query(
        userVer,
        where("email", "==", currentUser.email)
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => {
        return { role: data["role"] };
      });


    //   if (users[0].role === "administrator") {


    //   } else {
    //     window.location.href = "../../admin/logout";
    //     console.error("user not admin ");
    //   }
    // } else {
    //   window.location.href = "../../admin/logout";
    //   console.error("user empty ");
    // }
  });
  //end of auth check.

  const jobsContainer = document.getElementById("tbJobs");
  try {

    const jobsFer = collection(db, "jobs");
    const q = query(
      jobsFer,
      orderBy("Post", "asc")
    );
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        active: data["active"],
        closingDate: data["closingDate"],
        company: data["company"],
        description: data["description"],
        location: data["location"],
        jobType: data["jobType"],
        postedAt: data["postedAt"],
        title: data["title"],
        requirements: data["requirements"],

      };
    });

    processJobs(jobs);

  } catch (error) {
    console.error("Error fetching job posts: ", error);
  }

  function processJobs(jobs) {
    const jobsContainer = document.getElementById("tbJobs");
    jobsContainer.innerHTML = "";
    jobs.forEach(job => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${job.title}</td>
      <td>${job.company}</td>
      <td>${job.location}</td>
      <td>${job.jobType}</td>
      <td>${job.postedAt}</td>
      <td>${job.closingDate}</td>
      <td>${job.active ? "Yes" : "No"}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-job" data-id="${job.id}">Edit</button>
        <button class="btn btn-sm btn-danger delete-job" data-id="${job.id}">Delete</button>
      </td>
    `;
      jobsContainer.appendChild(row);
    });
  }

  btnSave.addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const location = document.getElementById("location").value;
    const jobType = document.getElementById("jobType").value;
    const postedAt = document.getElementById("postedAt").value;
    const closingDate = document.getElementById("closingDate").value;
    const active = document.getElementById("active").checked;
    const description = document.getElementById("description").value;
    const requirements = document.getElementById("requirements").value;

    try {
      const newJobRef = doc(collection(db, "jobs"));
      await setDoc(newJobRef, {
        title,
        company,
        location,
        jobType,
        postedAt,
        closingDate,
        active,
        description,
        requirements
      });
      console.log("Job post added successfully");
      // Optionally, refresh the job list
    } catch (error) {
      console.error("Error adding job post: ", error);
    }
  });
});



