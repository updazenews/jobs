import {
  collection,
  getDoc,
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

document.addEventListener("DOMContentLoaded", async () =>{
    const params = new URLSearchParams(window.location.search);
    const inputCompanyName = document.getElementById("inputCompanyName");
    const inputJobTitle = document.getElementById("inputJobTitle");
    const inputJobLocation = document.getElementById("inputJobLocation");
    const inputJobType = document.getElementById("inputJobType");
    const inputJobCategory = document.getElementById("inputJobCategory");
    const inputJobDescription = document.getElementById("inputJobDescription");
    const inputApplicationEmail = document.getElementById("inputApplicationEmail");
    const inputApplicationURL = document.getElementById("inputApplicationURL");
    const inputJobTags = document.getElementById("inputJobTags");
    const jobForm = document.getElementById("jobForm");
    const jobId = params.get("id");

    // Fetch existing job data
    
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    
    if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        inputCompanyName.value = jobData.companyName || "";
        inputJobTitle.value = jobData.jobTitle || "";
        inputJobLocation.value = jobData.jobLocation || "";
        inputJobType.value = jobData.jobType || "";
        inputJobCategory.value = jobData.jobCategory || "";
        inputJobDescription.value = jobData.jobDescription || "";
        inputApplicationEmail.value = jobData.applicationEmail || "";
        inputApplicationURL.value = jobData.applicationURL || "";
        inputJobTags.value = (jobData.jobTags || []).join(", ");
    }
    
    
});