import { collection, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { auth, db } from '../../../assets/js/jobs.js';

const form = document.getElementById('addJobForm');
const saveBtn = document.getElementById('btnSaveJob');
const msg = document.getElementById('formMsg');
const descriptionEditor = document.getElementById('descriptionEditor');
const requirementsEditor = document.getElementById('requirementsEditor');

wireEditors();

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const descriptionHtml = sanitizeRichText(descriptionEditor.innerHTML);
  const requirementsHtml = sanitizeRichText(requirementsEditor.innerHTML);

  const payload = {
    company: document.getElementById('inputCompanyName').value.trim(),
    title: document.getElementById('inputJobTitle').value.trim(),
    location: document.getElementById('inputLocation').value.trim(),
    closingDate: document.getElementById('inputClosingDate').value,
    jobType: document.getElementById('inputJobType').value,
    workType: document.getElementById('inputWorkType').value,
    description: descriptionHtml,
    requirements: requirementsHtml,
    url: document.getElementById('inputUrl').value.trim(),
  };

  if (!payload.company || !payload.title || !payload.location || !payload.closingDate || !payload.url) {
    return setMsg('Please complete all required fields.', 'text-danger');
  }
  if (!stripHtml(payload.description) || !stripHtml(payload.requirements)) {
    return setMsg('Description and requirements cannot be empty.', 'text-danger');
  }
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
    descriptionEditor.innerHTML = '';
    requirementsEditor.innerHTML = '';
    setTimeout(() => { window.location.href = '/admin/jobs.html'; }, 900);
  } catch (err) {
    console.error(err);
    setMsg('Failed to save job. Please try again.', 'text-danger');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Job';
  }
});

function wireEditors() {
  document.querySelectorAll('.editor-toolbar').forEach((toolbar) => {
    const targetId = toolbar.dataset.editorToolbar;
    const editor = document.getElementById(targetId);

    toolbar.querySelectorAll('button[data-command]').forEach((button) => {
      button.addEventListener('click', () => {
        editor.focus();
        const command = button.dataset.command;
        if (command === 'createLink') {
          const value = prompt('Enter URL (https://...)');
          if (value && /^https?:\/\//i.test(value.trim())) {
            document.execCommand('createLink', false, value.trim());
          }
          return;
        }
        document.execCommand(command, false, null);
      });
    });
  });
}

function sanitizeRichText(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'UL', 'OL', 'LI', 'A']);

  [...doc.body.querySelectorAll('*')].forEach((el) => {
    if (!allowed.has(el.tagName)) {
      el.replaceWith(...el.childNodes);
      return;
    }

    [...el.attributes].forEach((attr) => {
      if (el.tagName === 'A' && attr.name === 'href') return;
      el.removeAttribute(attr.name);
    });

    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) {
        el.replaceWith(...el.childNodes);
      } else {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  return doc.body.innerHTML.trim();
}

function stripHtml(html) {
  const text = new DOMParser().parseFromString(html || '', 'text/html').body.textContent || '';
  return text.trim();
}

function setMsg(text, className) {
  msg.className = `small ${className}`;
  msg.textContent = text;
}
