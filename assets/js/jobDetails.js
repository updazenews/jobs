import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '/assets/js/jobs.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const jobId = params.get('id');

  const loading = document.getElementById('detailsLoading');
  const error = document.getElementById('detailsError');
  const content = document.getElementById('jobContent');

  if (!jobId) {
    showError('Invalid job link.');
    return;
  }

  try {
    const snapshot = await getDoc(doc(db, 'jobs', jobId));

    if (!snapshot.exists()) {
      showError('Job not found.');
      return;
    }

    const job = snapshot.data();
    renderJob(job, jobId);
    loading.classList.add('d-none');
    content.classList.remove('d-none');
  } catch (e) {
    console.error('Failed to load job details:', e);
    showError('Unable to load this job right now.');
  }

  function showError(message) {
    loading.classList.add('d-none');
    error.textContent = message;
    error.classList.remove('d-none');
  }
});

function renderJob(job, jobId) {
  const title = job.title || 'Untitled role';
  const company = job.company || 'Unknown company';
  const location = job.location || 'South Africa';
  const jobType = job.jobType || 'N/A';
  const workType = job.workType || 'N/A';
  const url = job.url || `/details.html?id=${encodeURIComponent(jobId)}`;
  const description = job.description || 'No description provided.';
  const requirements = job.requirements || 'No requirements specified.';

  const closingDate = toDate(job.closingDate);
  const closingText = closingDate ? closingDate.toLocaleDateString('en-ZA') : 'Not specified';

  document.title = `${title} | Sebenza Portal`;
  document.getElementById('title').textContent = `${title} at ${company}`;
  document.getElementById('subtitle').textContent = `${location}`;
  document.getElementById('jobTypeBadge').textContent = String(jobType);
  document.getElementById('workTypeBadge').textContent = String(workType);
  document.getElementById('closingDateBadge').textContent = `Closing: ${closingText}`;
  document.getElementById('Description').textContent = description;
  document.getElementById('Requirements').textContent = requirements;

  const applyBtn = document.getElementById('applyNow');
  applyBtn.href = url;

  const shareUrl = encodeURIComponent(url);
  document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${shareUrl}`;
  document.getElementById('share-linkedin').href = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  document.getElementById('share-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
}

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  return new Date(value);
}
