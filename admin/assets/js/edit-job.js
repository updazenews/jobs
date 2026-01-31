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
    const btnSubmit = document.getElementById("btnsubmit");
    const editDataSection = document.getElementById("editData");
    const editDataPlaceholder = document.getElementById("editDataPlaceholder");

    btnSubmit.addEventListener("click", async (e) => {
        e.preventDefault();
        const updatedJobData = {
            company: inputCompanyName.value,
            title: inputJobTitle.value,
            location: inputJobLocation.value,
            jobType: inputJobType.value,
            workType: inputWorkType.value,
            description: inputJobDescription.value,
            closingDate: inputClosingDate.value,
            url: inputApplicationURL.value,
            requirements: inputJobRequirements.value
        };
        await updateDoc(doc(db, "jobs", jobId), updatedJobData);
        window.location.href = "/admin/jobs";
    });

    // Fetch existing job data
    
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    
    if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        inputCompanyName.value = jobData.company || "";
        inputJobTitle.value = jobData.title || "";
        inputJobLocation.value = jobData.location || "";
        inputJobType.value = jobData.jobType || "";
        inputWorkType.value = jobData.inputWorkType || "";
        inputJobDescription.value = jobData.description || "";
        inputClosingDate.value = jobData.closingDate || "";
        inputApplicationURL.value = jobData.url || "";
        inputJobRequirements.value = jobData.requirements || "";
        //inputJobTags.value = (jobData.jobTags || []).join(", ");
        editDataSection.style.display = "block";
        editDataSection.style.visibility = "visible";
        editDataPlaceholder.style.visibility = "hidden";        
        editDataSectionholder.style.display = "none";
    }
    
    
});