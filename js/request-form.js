/* BookWorkGo — customer service request form (sent by the visitor's own email app). */
(function () {
  'use strict';

  var NS = window.BookWorkGo;
  if (!NS || !NS.setupDraftForm) return;

  var dateInput = document.getElementById('b-date');
  if (dateInput) dateInput.min = NS.todayISO();

  NS.setupDraftForm({
    formId: 'request-form',
    reviewId: 'request-review',
    subject: function (rows) {
      var get = function (n) { return (rows.filter(function (r) { return r.name === n; })[0] || {}).value; };
      return 'Cleaning request: ' + get('unit_size') + ', ' + get('city');
    },
    intro: 'New vacant unit cleaning request. The preferred date is a preference, not a confirmed appointment.',

    checks: function (form) {
      NS.patternMessages(form, {
        zip: 'Enter a five-digit ZIP code.',
        phone: 'Use digits, spaces, dashes, dots, or parentheses.'
      });
      var date = form.elements.namedItem('preferred_date');
      date.setCustomValidity('');
      if (date.value && date.value < NS.todayISO()) {
        date.setCustomValidity('Choose today or a later date. This is a preference, not an appointment.');
      }
      // Texts need a number to go to.
      var phone = form.elements.namedItem('phone');
      var sms = form.elements.namedItem('sms_consent');
      if (sms && sms.checked && !phone.value.trim()) {
        phone.setCustomValidity('Add a phone number to receive text messages, or uncheck the text message box.');
      }
    },

    fields: [
      { name: 'name', label: 'Name' },
      { name: 'company', label: 'Company or property' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' },
      { name: 'city', label: 'City' },
      { name: 'zip', label: 'ZIP code' },
      { name: 'unit_size', label: 'Unit size' },
      { name: 'preferred_date', label: 'Preferred date (not an appointment)', format: NS.formatDate },
      { name: 'condition', label: 'Unit condition' },
      { name: 'notes', label: 'Notes', fallback: 'None' },
      { name: 'sms_consent', label: 'Text messages', format: function () { return 'Yes, agreed to receive texts about this request'; }, fallback: 'No' }
    ]
  });
})();
