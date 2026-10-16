/* BookWorkGo — provider interest form (preview: nothing is sent or reviewed). */
(function () {
  'use strict';

  var NS = window.BookWorkGo;
  if (!NS || !NS.setupDraftForm) return;

  NS.setupDraftForm({
    formId: 'provider-form',
    reviewId: 'provider-review',
    fileStem: 'bookworkgo-provider-draft',
    draftOf: 'BookWorkGo provider interest',
    status: 'Draft only. Not submitted to BookWorkGo. Not reviewed or approved, and not an offer of work.',

    checks: function (form) {
      NS.patternMessages(form, { phone: 'Use digits, spaces, dashes, dots, or parentheses.' });
      // A checkbox group can't be "required" natively, so the first box carries the message.
      var areas = form.querySelectorAll('input[name="service_area"]');
      var anyChecked = Array.prototype.some.call(areas, function (box) { return box.checked; });
      if (areas.length) areas[0].setCustomValidity(anyChecked ? '' : 'Choose at least one service area.');
    },

    fields: [
      { name: 'contact_name', label: 'Contact name' },
      { name: 'business_name', label: 'Business name' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' },
      { name: 'service_area', label: 'Service area', multiple: true },
      { name: 'crews', label: 'Available crews' },
      { name: 'insurance', label: 'General liability insurance' },
      { name: 'experience', label: 'Experience, rates, availability' },
      { name: 'sms_consent', label: 'Text messages', format: function () { return 'Yes, agreed to receive texts about jobs and the application'; }, fallback: 'No' }
    ]
  });
})();
