import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./jobs.js";
document.addEventListener("DOMContentLoaded", async () => {
  const jobsContainer = document.getElementById("jobsContainer");

  jobsContainer.innerHTML = `
    <div class="col-12 text-center text-muted">
      Loading job postings...
    </div>
  `;

  try {
    const jobsRef = collection(db, "jobs");
    const q = query(
      jobsRef,
      where("active", "==", true),
      orderBy("postedAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      jobsContainer.innerHTML = `
        <div class="col-12 text-center text-muted">
          No job postings available at the moment.
        </div>
      `;
      return;
    }

    // Convert Firestore docs to SAME structure your renderer expects
    const jobs = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        title: data.title,
        company: data.company,
        category: data.category ?? "General",
        location: data.location ?? "South Africa",
        closing_date: data.closingDate,
        slug: doc.id // using document ID instead of PHP slug
      };
    });

    renderJobs(jobs);

  } catch (error) {
    console.error(error);
    jobsContainer.innerHTML = `
      <div class="col-12 text-danger text-center">
        Failed to load jobs. Please try again later.
      </div>
    `;
  }

  // 🔽 YOUR EXISTING RENDERER (UNCHANGED)
  function renderJobs(jobs) {
    jobsContainer.innerHTML = "";

    jobs.forEach(job => {
      if (job.active !== false) {
        const closingDateDate = new Date(job.closingDate.seconds * 1000 + job.closingDate.nanoseconds / 1000000);
            

        const card = `
        <div class="col">
          <div class="card">
            <div class="row g-3">
              <div class="col-md">
                  <div class="card-body">
                    <h5 class="card-title">${escapeHTML(job.title)}</h5>
                    <p class="card-text">Company: ${escapeHTML(job.company)}</p>
                    <p class="card-text">Category: ${escapeHTML(job.category)}</p>
                    <p class="card-text">Location: ${escapeHTML(job.location)}</p>
                    <p class="card-text"><small class="text-body-secondary">Closing Date: ${closingDateDate.toLocaleDateString("en-ZA")}</small></p>
                    <a href="#" class="btn btn-primary">View Details</a>
                  </div>
              </div>
            </div>
          </div>
        </div>
      `;

        jobsContainer.insertAdjacentHTML("beforeend", card);
      }
    });
  }

  //YOUR SECURITY HELPER (UNCHANGED)
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
