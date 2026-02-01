import{
    getDoc,
    doc,
}from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {db} from"../../assets/js/jobs.js";

document.addEventListener("DOMContentLoaded",async()=>{
    const params=new URLSearchParams(window.location.search);
    const titleElement=document.getElementById("title");
    const subtitleElement=document.getElementById("subtitle");
    const applyNowButton=document.getElementById("applyNow");
    const jobId=params.get("id");

    const jobDoc = await getDoc(doc(db, "jobs", jobId));

    if(jobDoc.exists()){
        const jobData=jobDoc.data();
        titleElement.textContent=`${jobData.title} at ${jobData.company}`;
        subtitleElement.textContent=`Location: ${jobData.location} | Type: ${jobData.jobType} | Work Type: ${jobData.workType}`;
        applyNowButton.href=`${jobData.url}`;
        
    }
});