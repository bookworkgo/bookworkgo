/* BookWorkGo — text message opt-in form (preview: nothing is sent, nobody is signed up). */
(function () {
  'use strict';

  var NS = window.BookWorkGo;
  if (!NS || !NS.setupDraftForm) return;

  NS.setupDraftForm({
    formId: 'optin-form',
    reviewId: 'optin-review',
    fileStem: 'bookworkgo-text-optin-draft',
    draftOf: 'BookWorkGo text message opt-in',
    status: 'Draft only. Not submitted to BookWorkGo. Not signed up; no texts will be sent.',

    checks: function (form) {
      var phoneMsg = 'Enter a mobile number with at least 10 digits, for example (303) 555-0100.';
      NS.patternMessages(form, { phone: phoneMsg });
      var phone = form.elements.namedItem('phone');
      if (phone.value && !phone.validity.patternMismatch && phone.value.replace(/\D/g, '').length < 10) {
        phone.setCustomValidity(phoneMsg);
      }
      var consent = form.elements.namedItem('sms_consent');
      consent.setCustomValidity(consent.checked ? '' : 'Check the box to agree to text messages, or leave this page.');
    },

    fields: [
      { name: 'name', label: 'Name' },
      { name: 'phone', label: 'Mobile phone number' },
      { name: 'role', label: 'I am a' },
      { name: 'sms_consent', label: 'Text message consent', format: function () { return 'Yes, agreed to the text message terms shown on the form'; } }
    ]
  });
})();
