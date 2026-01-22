document.addEventListener("DOMContentLoaded", () => {
    const jobsContainer = document.getElementById("jobsContainer");

    // API endpoint
    const API_URL = "http://api-updaze.yzz.me/api/jobs/list.php";

    // Fetch jobs
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch jobs");
            }
            return response.json();
        })
        .then(result => {
            if (!result.success || result.count === 0) {
                jobsContainer.innerHTML = `
                    <div class="col-12 text-center text-muted">
                        No job postings available at the moment.
                    </div>`;
                return;
            }

            renderJobs(result.data);
        })
        .catch(error => {
            console.error(error);
            jobsContainer.innerHTML = `
                <div class="col-12 text-danger text-center">
                    Failed to load jobs. Please try again later.
                </div>`;
        });

    // Render job cards
    function renderJobs(jobs) {
        jobsContainer.innerHTML = "";

        jobs.forEach(job => {
            const closingDate = job.closing_date
                ? new Date(job.closing_date).toLocaleDateString("en-ZA")
                : "Open until filled";

            const card = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm">
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

                            <a href="job.html?slug=${encodeURIComponent(job.slug)}"
                               class="btn btn-primary mt-auto">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            `;

            jobsContainer.insertAdjacentHTML("beforeend", card);
        });
    }

    // Basic HTML escaping (security)
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
