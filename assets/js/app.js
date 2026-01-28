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
        closing_date: data.closingDate
          ? data.closingDate.toDate()
          : null,
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
        const closingDate = job.closing_date
          ? new Date(job.closing_date).toLocaleDateString("en-ZA")
          : "Open until filled";

        const card = `
        <div class="col">
          <div class="card mb-4 rounded-3 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${escapeHTML(job.title)}</h5>

              <h6 class="card-subtitle mb-2 text-muted">
                ${escapeHTML(job.company)}
              </h6>

              <p class="mb-1">
                <strong>Category:</strong> ${escapeHTML(job.category)}
              </p>

              <p class="mb-1">
                <strong>Location:</strong> ${escapeHTML(job.location)}
              </p>

              <p class="mb-3">
                <strong>Closing date:</strong> ${closingDate}
              </p>

              <a href="job.html?id=${encodeURIComponent(job.slug)}"
                 class="btn btn-primary mt-auto">
                View Details
              </a>
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
