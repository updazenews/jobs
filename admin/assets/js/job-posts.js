import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  updateDoc, 
  deleteField,
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
    const loadingDiv = document.getElementById("loadingDiv");
    loadingDiv.style.display = "none";
    jobsContainer.innerHTML = "";
    jobs.forEach(job => {

      if (job.active !== false) {
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
              <a class="btn btn-sm btn-primary" href="././edit?id=${job.id}">Edit</a>
              <button class="btn btn-sm btn-danger delete-job" data-id="${job.id}"
          data-title="${job.title}">Delete</button>
            </td>
          `;
            jobsContainer.appendChild(row);
      }
    });
  }


  document.addEventListener('click', function (e) {

    // EDIT
    if (e.target.classList.contains('edit-job')) {
      const id = e.target.dataset.id;
      const title = e.target.dataset.title;

      if (confirm(`Do you want to edit "${title}"?`)) {
        window.location.href = `/jobs/edit/${id}`;
      }
    }

    // DELETE
    if (e.target.classList.contains('delete-job')) {
      const id = e.target.dataset.id;
      const title = e.target.dataset.title;

      if (confirm(`Are you sure you want to delete "${title}"?`)) {
        console.log('Deleting job:', id);

        const jobRef = doc(db, "jobs", id);
        // call delete API here
        updateDoc(jobRef, {
          active: false,
          deletedAt: new Date() 
        })
        .then(() => {
          //Refresh the page after successful deletion
          document.location.reload();
        })
        .catch((error) => {
          console.error("Error deleting job post: ", error);
        });
      }
    }
  });




  btnSave.addEventListener("click", async () => {
    const title = document.getElementById("inputJobTitle").value;
    const company = document.getElementById("inputCompanyName").value;
    const location = document.getElementById("inputLocation").value;
    const jobType = document.getElementById("inputJobType").value;
    const postedAt = new Date(Date.now());
    const closingDate = document.getElementById("inputClosingDate").value;
    const inputWorkType = document.getElementById("inputWorkType").value;
    const description = document.getElementById("inputJobDescription").value;
    const requirements = document.getElementById("inputJobRequirements").value;
    const active = true;

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
        requirements,
        active
      })
        .then(() => {
          //Refresh the page after successful addition
          document.location.reload();
        });
      console.log("Job post added successfully");
      // Optionally, refresh the job list


    } catch (error) {
      console.error("Error adding job post: ", error);
    }
  });

  document.getElementById("uploadBtn").addEventListener("change", function (event) {

  });
});



