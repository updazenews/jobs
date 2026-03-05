(function () {
  const STORAGE_KEY = 'sebenza_cookie_notice_choice';
  const existingChoice = localStorage.getItem(STORAGE_KEY);

  if (existingChoice === 'yes' || existingChoice === 'no') {
    return;
  }

  const banner = document.createElement('div');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.style.position = 'fixed';
  banner.style.left = '1rem';
  banner.style.right = '1rem';
  banner.style.bottom = '1rem';
  banner.style.zIndex = '9999';
  banner.style.background = '#111827';
  banner.style.color = '#ffffff';
  banner.style.padding = '0.9rem 1rem';
  banner.style.borderRadius = '0.75rem';
  banner.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
  banner.style.display = 'flex';
  banner.style.flexDirection = 'column';
  banner.style.gap = '0.7rem';

  const message = document.createElement('p');
  message.style.margin = '0';
  message.style.fontSize = '0.95rem';
  message.innerHTML = 'We are collecting cookies to keep the website running. Read our <a href="/terms-and-condition.html" style="color:#93c5fd;">Terms</a> and <a href="/privacy-policy.html" style="color:#93c5fd;">Policies</a>.';

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '0.5rem';
  actions.style.flexWrap = 'wrap';

  const yesButton = document.createElement('button');
  yesButton.type = 'button';
  yesButton.textContent = 'Yes';
  yesButton.style.border = '0';
  yesButton.style.padding = '0.45rem 0.9rem';
  yesButton.style.borderRadius = '0.5rem';
  yesButton.style.background = '#2563eb';
  yesButton.style.color = '#fff';
  yesButton.style.cursor = 'pointer';
  yesButton.addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, 'yes');
    banner.remove();
  });

  const noButton = document.createElement('button');
  noButton.type = 'button';
  noButton.textContent = 'No';
  noButton.style.border = '1px solid #93c5fd';
  noButton.style.padding = '0.45rem 0.9rem';
  noButton.style.borderRadius = '0.5rem';
  noButton.style.background = 'transparent';
  noButton.style.color = '#ffffff';
  noButton.style.cursor = 'pointer';
  noButton.addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, 'no');
    banner.remove();
  });

  actions.appendChild(yesButton);
  actions.appendChild(noButton);
  banner.appendChild(message);
  banner.appendChild(actions);
  document.body.appendChild(banner);
})();
