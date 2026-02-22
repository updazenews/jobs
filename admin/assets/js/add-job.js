import { collection, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { auth, db } from '../../../assets/js/jobs.js';

const form = document.getElementById('addJobForm');
const saveBtn = document.getElementById('btnSaveJob');
const msg = document.getElementById('formMsg');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    company: document.getElementById('inputCompanyName').value.trim(),
    title: document.getElementById('inputJobTitle').value.trim(),
    location: document.getElementById('inputLocation').value.trim(),
    closingDate: document.getElementById('inputClosingDate').value,
    jobType: document.getElementById('inputJobType').value,
    workType: document.getElementById('inputWorkType').value,
    description: document.getElementById('inputJobDescription').value.trim(),
    requirements: document.getElementById('inputJobRequirements').value.trim(),
    url: document.getElementById('inputUrl').value.trim(),
  };

  if (Object.values(payload).some((v) => !v)) return setMsg('Please complete all fields.', 'text-danger');
  if (!/^https?:\/\//i.test(payload.url)) return setMsg('Application URL must start with http:// or https://', 'text-danger');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closing = new Date(payload.closingDate);
  if (closing < today) return setMsg('Closing date cannot be in the past.', 'text-danger');

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    await setDoc(doc(collection(db, 'jobs')), {
      ...payload,
      closingDate: closing,
      postedAt: new Date(),
      active: true,
      createdBy: auth.currentUser?.uid || 'unknown',
    });
    setMsg('Job saved. Redirecting to jobs page...', 'text-success');
    form.reset();
    setTimeout(() => { window.location.href = '/admin/jobs.html'; }, 900);
  } catch (err) {
    console.error(err);
    setMsg('Failed to save job. Please try again.', 'text-danger');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Job';
  }
});

function setMsg(text, className) {
  msg.className = `small ${className}`;
  msg.textContent = text;
}
