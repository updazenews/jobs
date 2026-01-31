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
    const inputJobLocation = document.getElementById("inputLocation");
    const inputJobType = document.getElementById("inputJobType");
    const inputWorkType = document.getElementById("inputWorkType");
    const inputJobDescription = document.getElementById("inputJobDescription");
    const inputClosingDate = document.getElementById("inputClosingDate");
    const inputApplicationURL = document.getElementById("inputApplicationURL");
    const inputJobRequirements = document.getElementById("inputJobRequirements");
    const jobId = params.get("id");

    // Fetch existing job data
    
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    
    if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        inputCompanyName.value = jobData.company || "";
        inputJobTitle.value = jobData.title || "";
        inputJobLocation.value = jobData.location || "";
        inputJobType.value = jobData.jobType || "";
        inputWorkType.value = jobData.workType || "";
        inputJobDescription.value = jobData.description || "";
        inputClosingDate.value = jobData.closingDate || "";
        inputApplicationURL.value = jobData.url || "";
        inputJobRequirements.value = jobData.requirements || "";
        //inputJobTags.value = (jobData.jobTags || []).join(", ");
    }
    
    
});