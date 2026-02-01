import {
    getDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "../../assets/js/jobs.js";

document.addEventListener("DOMContentLoaded", async () => {
    const jobTitle = document.getElementById('job-title')?.innerText || 'New Job Opportunity';
    const jobUrl = window.location.href;
    const params = new URLSearchParams(window.location.search);
    const titleElement = document.getElementById("title");
    const subtitleElement = document.getElementById("subtitle");
    const applyNowButton = document.getElementById("applyNow");
    const applyNowButton2 = document.getElementById("applyNow2");
    const descriptionElement = document.getElementById("Description");
    const requirementsElement = document.getElementById("Requirements");

    const jobId = params.get("id");

    const jobDoc = await getDoc(doc(db, "jobs", jobId));

    if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        titleElement.textContent = `${jobData.title} at ${jobData.company}`;
        subtitleElement.innerHTML = `<i class="bi bi-geo-alt-fill"></i> Location: ${jobData.location} <br/><i class="bi bi-bookmark-check-fill"></i> Type: ${jobData.jobType}  <br\><i class="bi bi-bookmark-check-fill"></i> Work Type: ${jobData.workType}`;
        descriptionElement.textContent = jobData.description;
        requirementsElement.textContent = jobData.requirements;
        applyNowButton.href = `${jobData.url}`;
        applyNowButton2.href = `${jobData.url}`;
        document.getElementById('share-facebook').href =
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobData.url)}`;

        document.getElementById('share-twitter').href =
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(jobData.title)}&url=${encodeURIComponent(jobData.url)}`;

        document.getElementById('share-linkedin').href =
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobData.url)}`;

        document.getElementById('share-whatsapp').href =
            `https://wa.me/?text=${encodeURIComponent(jobData.title + ' - ' + jobData.url)}`;

    }
});