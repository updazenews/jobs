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

  const btnSave = document.getElementById("btnSaveJob");
  //Check if the user is authorised to access this page.
  // const auth = getAuth();
  // onAuthStateChanged(auth, async (user) => {  

  //   if (user) {
  //    const userVer = collection(db, "users");
  //     const q = query(
  //       userVer,
  //       where("email", "==", user.email)
  //     );
  //     const snapshot = await getDocs(q);
  //     const users = snapshot.docs.map(doc => {
  //       return { role: data["role"] };
  //     });


  //     if (users[0].role === "administrator") {


  //     } else {
  //       window.location.href = "../../admin/logout";
  //       console.error("user not admin ");
  //     }
  //   } else {
  //     window.location.href = "../../admin/logout";
  //     console.error("user empty ");
  //   }
  // });
  // //end of auth check.

  const jobsContainer = document.getElementById("tbJobs");
  try {

    const jobsFer = collection(db, "jobs");
    const q = query(
      jobsFer,
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

      var postedAtDate = new Date(job.postedAt.seconds * 1000 + job.postedAt.nanoseconds / 1000000);
      var closingDateDate = new Date(job.closingDate.seconds * 1000 + job.closingDate.nanoseconds / 1000000);
      job.postedAt = postedAtDate.toLocaleDateString();
      job.closingDate = closingDateDate.toLocaleDateString();
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
    const title = document.getElementById("inputJobTitle").value;
    const company = document.getElementById("inputCompanyName").value;
    const location = document.getElementById("inputLocation").value;
    const jobType = document.getElementById("inputJobType").value;
    const postedAt = Date.now();
    const closingDate = document.getElementById("closingDate").value;
    const inputWorkType = document.getElementById("inputWorkType").value;
    const description = document.getElementById("inputJobDescription").value;
    const requirements = document.getElementById("inputJobRequirements").value;

    try {
      const newJobRef = doc(collection(db, "jobs"));
      await setDoc(newJobRef, {
        title,
        company,
        location,
        jobType,
        postedAt,
        closingDate,
        inputWorkType,
        description,
        requirements
      });
      console.log("Job post added successfully");
      // Optionally, refresh the job list

      document.getElementById("inputJobTitle").value = "";
      document.getElementById("inputCompanyName").value = "";
      document.getElementById("inputLocation").value = "";
      document.getElementById("inputJobType").value = "";
      document.getElementById("closingDate").value = "";
      document.getElementById("inputJobDescription").value = "";
      document.getElementById("inputJobRequirements").value = "";
    } catch (error) {
      console.error("Error adding job post: ", error);
    }
  });
});



