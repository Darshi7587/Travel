export function initializeContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    subject: document.getElementById('subject'),
    message: document.getElementById('message'),
  };

  const errorFields = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    subject: document.getElementById('subject-error'),
    message: document.getElementById('message-error'),
  };

  const successMessage = document.getElementById('contact-success');

  function setError(fieldName, message) {
    const field = fields[fieldName];
    const error = errorFields[fieldName];
    if (field) {
      field.classList.toggle('error-input', Boolean(message));
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    if (error) {
      error.textContent = message || '';
    }
  }

  function validateForm() {
    let valid = true;

    const nameValue = fields.name.value.trim();
    if (!nameValue) {
      setError('name', 'Name is required.');
      valid = false;
    } else {
      setError('name', '');
    }

    const emailValue = fields.email.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    } else {
      setError('email', '');
    }

    const subjectValue = fields.subject.value.trim();
    if (!subjectValue) {
      setError('subject', 'Subject is required.');
      valid = false;
    } else {
      setError('subject', '');
    }

    const messageValue = fields.message.value.trim();
    if (messageValue.length < 20) {
      setError('message', 'Message must be at least 20 characters long.');
      valid = false;
    } else {
      setError('message', '');
    }

    return valid;
  }

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = validateForm();

    if (!isValid) {
      if (successMessage) {
        successMessage.textContent = '';
      }
      return;
    }

    if (successMessage) {
      successMessage.textContent = 'Your message looks valid for this demo form. No real email has been sent, because this is a frontend-only website.';
    }

    contactForm.reset();
    Object.keys(fields).forEach((name) => setError(name, ''));
  });
}
