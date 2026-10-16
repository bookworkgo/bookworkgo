/*
 * BookWorkGo — shared form behavior: validate, review, then send by email.
 *
 * The website itself transmits nothing. After a visitor reviews their
 * details, "Send by email" opens their own email app with a message to
 * BookWorkGo already filled in; it is sent only when they press Send there.
 * "Copy details" is the fallback for visitors without an email app.
 * Personal details live only in page memory and are cleared on
 * "Start over" or page reload.
 *
 * To switch to direct submissions later (for example a small API), replace
 * the email step in setupDraftForm. Never place private keys in this file:
 * anything here is public.
 */
(function () {
  'use strict';

  var NS = (window.BookWorkGo = window.BookWorkGo || {});

  NS.contact = {
    email: 'BookWorkGoGo@gmail.com',
    phone: '(888) 686-0144',
    phoneE164: '+18886860144'
  };

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
   *   subject(rows)      email subject line
   *   intro              first line of the email body
   */
  NS.setupDraftForm = function (options) {
    var form = document.getElementById(options.formId);
    var review = document.getElementById(options.reviewId);
    if (!form || !review) return;

    var list = review.querySelector('[data-review-list]');
    var statusEl = review.querySelector('[data-status]');
    var emailLink = review.querySelector('[data-email-link]');
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

    function asText() {
      var lines = [options.intro, ''];
      rows.forEach(function (row) {
        lines.push(row.label + ': ' + row.value.replace(/\r?\n/g, '\n  '));
      });
      lines.push('', 'Sent from the form at ' + location.origin + location.pathname);
      return lines.join('\n');
    }

    function mailtoHref() {
      var subject = typeof options.subject === 'function' ? options.subject(rows) : options.subject;
      return 'mailto:' + NS.contact.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(asText());
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
      if (emailLink) emailLink.href = mailtoHref();
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

    function copyDetails() {
      var text = asText();
      function done() {
        statusEl.textContent = 'Copied. Paste it into an email to ' + NS.contact.email + ', or text the details to ' + NS.contact.phone + '.';
      }
      function fallback() {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        area.remove();
        if (ok) done();
        else statusEl.textContent = 'This browser blocked copying. Please email the details above to ' + NS.contact.email + '.';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
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
      render();
      showReview();
    });

    review.addEventListener('click', function (event) {
      var target = event.target.closest('[data-action], [data-email-link]');
      if (!target) return;
      if (target.hasAttribute('data-email-link')) {
        // The link opens the visitor's email app; nothing is sent from this page.
        statusEl.textContent = 'Your email app should open with everything filled in. Press Send there to reach us. Nothing opened? Use Copy details instead.';
        return;
      }
      var action = target.getAttribute('data-action');
      if (action === 'edit') {
        showForm();
      } else if (action === 'copy') {
        copyDetails();
      } else if (action === 'reset') {
        form.reset();
        rows = [];
        list.replaceChildren();
        if (emailLink) emailLink.removeAttribute('href');
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
