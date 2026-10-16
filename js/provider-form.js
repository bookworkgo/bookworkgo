/* BookWorkGo — provider interest form (sent by the visitor's own email app). */
(function () {
  'use strict';

  var NS = window.BookWorkGo;
  if (!NS || !NS.setupDraftForm) return;

  NS.setupDraftForm({
    formId: 'provider-form',
    reviewId: 'provider-review',
    subject: function (rows) {
      var biz = (rows.filter(function (r) { return r.name === 'business_name'; })[0] || {}).value;
      return 'Service pro application: ' + biz;
    },
    intro: 'New service pro application. Applying does not guarantee approval or jobs.',

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
