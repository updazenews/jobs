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
    const now = new Date();
    jobs.forEach(job => {
      if (job.active !== false) {
        const closingDateDate = new Date(job.closing_date.seconds * 1000 + job.closing_date.nanoseconds / 1000000);

        // Difference in days
        const diffInDays = (closingDateDate - now) / (1000 * 60 * 60 * 24);

        // Show badge only if closing date is within 30 days and not expired
        const closesSoonBadge = (diffInDays > 0 && diffInDays <= 30)
          ? `
      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        Closes \nsoon!
        <span class="visually-hidden">Alert</span>
      </span>
    `
          : "";
        const card = `
        <div class="col">
          <div class="card">
          ${closesSoonBadge}
            <div class="row g-3">
              <div class="col-md">
                  <div class="card-body">
                    <h5 class="card-title">${escapeHTML(job.title)}</h5>
                    <p class="card-text"><i class="bi bi-buildings-fill"></i> Company: ${escapeHTML(job.company)}</p>
                    <p class="card-text"><i class="bi bi-bookmark-check-fill"></i> Category: ${escapeHTML(job.category)}</p>
                    <p class="card-text"><i class="bi bi-geo-alt-fill"></i> Location: ${escapeHTML(job.location)}</p>
                    <p class="card-text"><small class="text-body-secondary">Closing Date: ${closingDateDate.toLocaleDateString("en-ZA")}</small></p>
                    <a href="details.html?jobId=${job.slug}" class="btn btn-primary">View Details</a>
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
