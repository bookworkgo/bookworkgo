/*
 * BookWorkGo — shared "review and download a draft" form behavior.
 *
 * Preview mode: nothing on this page is transmitted anywhere. A form is
 * validated in the browser, shown back as a review summary, and can be
 * downloaded as a draft file to the visitor's own device. Personal details
 * live only in page memory and are cleared on "Start over" or page reload.
 *
 * When a real, verified submission destination exists, the place to add it
 * is the "submit" step in setupDraftForm (see the note there). Never place
 * private keys in this file: anything here is public.
 */
(function () {
  'use strict';

  var NS = (window.BookWorkGo = window.BookWorkGo || {});

  /** Today's date in the visitor's time zone, as YYYY-MM-DD. */
  NS.todayISO = function () {
    var d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  /** "2026-10-15" -> "Thursday, October 15, 2026" (falls back to the raw value). */
  NS.formatDate = function (iso) {
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  /** Replace the browser's generic pattern message with a plain one, per field name. */
  NS.patternMessages = function (form, messages) {
    Object.keys(messages).forEach(function (name) {
      var el = form.elements.namedItem(name);
      if (!el || !el.setCustomValidity) return;
      el.setCustomValidity('');
      if (el.validity.patternMismatch) el.setCustomValidity(messages[name]);
    });
  };

  /**
   * Wire a form to its review panel.
   *
   * options:
   *   formId, reviewId   element ids
   *   fields             [{ name, label, multiple?, format?(raw), fallback? }]
   *   checks(form)       optional: sets custom validity messages before validation
   *   draftOf, status    text written into the downloaded draft
   *   fileStem           download file name prefix
   */
  NS.setupDraftForm = function (options) {
    var form = document.getElementById(options.formId);
    var review = document.getElementById(options.reviewId);
    if (!form || !review) return;

    var list = review.querySelector('[data-review-list]');
    var statusEl = review.querySelector('[data-status]');
    var heading = review.querySelector('h3, h4');
    var rows = [];

    function runChecks() {
      if (typeof options.checks === 'function') options.checks(form);
    }

    function collect() {
      var data = new FormData(form);
      return options.fields.map(function (field) {
        var raw = field.multiple
          ? data.getAll(field.name).map(function (v) { return String(v).trim(); }).filter(Boolean).join(', ')
          : String(data.get(field.name) || '').trim();
        var shown = raw ? (field.format ? field.format(raw) : raw) : (field.fallback || 'Not provided');
        return { name: field.name, label: field.label, value: shown };
      });
    }

    // Text only: user input is never parsed as markup.
    function render() {
      var frag = document.createDocumentFragment();
      rows.forEach(function (row) {
        var wrap = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = row.label;
        dd.textContent = row.value;
        wrap.appendChild(dt);
        wrap.appendChild(dd);
        frag.appendChild(wrap);
      });
      list.replaceChildren(frag);
    }

    function showForm() {
      review.hidden = true;
      form.hidden = false;
      statusEl.textContent = '';
      var first = form.querySelector('input, select, textarea');
      if (first) first.focus();
    }

    function showReview() {
      form.hidden = true;
      review.hidden = false;
      statusEl.textContent = '';
      if (heading) heading.focus();
    }

    function download() {
      var payload = {
        draftOf: options.draftOf,
        status: options.status,
        preparedAt: new Date().toISOString(),
        fields: rows
      };
      try {
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = options.fileStem + '-' + NS.todayISO() + '.json';
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        statusEl.textContent = 'Draft file saved to this device. It has not been sent anywhere.';
      } catch (err) {
        statusEl.textContent = 'This browser could not create the download. Your details are shown above and have not been sent anywhere.';
      }
    }

    form.addEventListener('input', runChecks);
    form.addEventListener('change', runChecks);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runChecks();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      rows = collect();
      // Future integration point: once a verified destination exists, send
      // `rows` here and only then change the preview wording on the page.
      render();
      showReview();
    });

    review.addEventListener('click', function (event) {
      var button = event.target.closest('[data-action]');
      if (!button) return;
      var action = button.getAttribute('data-action');
      if (action === 'edit') {
        showForm();
      } else if (action === 'download') {
        download();
      } else if (action === 'reset') {
        form.reset();
        rows = [];
        list.replaceChildren();
        runChecks();
        showForm();
      }
    });

    runChecks();
    // Submit buttons ship disabled so the form can't fall back to a
    // browser default submission (which would put details in the address bar).
    form.querySelectorAll('button[type="submit"]').forEach(function (b) { b.disabled = false; });
  };
})();
