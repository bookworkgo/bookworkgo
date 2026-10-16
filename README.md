# BookWorkGo website

Static site for [bookworkgo.com](https://bookworkgo.com), published with GitHub Pages from the root of `main`. Plain HTML, CSS and JavaScript; no framework or build step.

## Pages

| Address | File | What it is |
| --- | --- | --- |
| `/` | `index.html` | Landing page with the customer request and provider forms |
| `/opt-in/` | `opt-in/index.html` | Text message program details, sample messages, and opt-in form |
| `/terms-of-service/` | `terms-of-service/index.html` | Terms of Service, including text message terms |
| `/privacy-policy/` | `privacy-policy/index.html` | Privacy Policy, including the text message privacy statement |

Each page is a folder with an `index.html`, so the clean addresses work on direct visits and refreshes. All links and asset paths are relative, so the site also works under a GitHub Pages project subpath.

## Files

```
index.html
opt-in/index.html
terms-of-service/index.html
privacy-policy/index.html
css/site.css            shared styles for every page
js/draft-form.js        shared form behavior: validate, review summary, draft download
js/request-form.js      customer request form
js/provider-form.js     provider form
js/optin-form.js        text message opt-in form
screenshots/            screenshots of each page (desktop 1440 px, mobile 390 px)
CNAME                   custom domain (keep)
.nojekyll               serve files as-is, without Jekyll processing
```

## Before launch

- **Support contact.** Search for `[support email]` (five spots across the three new pages) and replace it with the real support email address.
- **Forms are preview-only.** No form sends anything yet: each one validates in the browser, shows a review summary, and offers a draft file download. The "Design preview" notices say so. Connect a real, verified submission destination in `js/draft-form.js` (see the comment in the submit handler), then update the preview wording. Never put private keys in browser code.
- **Text messaging registration.** Messaging providers review the opt-in page and the consent wording. A form that says it doesn't send anything may be questioned, so connect submissions before registering if possible.
- **Legal review.** The Terms of Service and Privacy Policy were drafted for an early pilot and should be reviewed by a lawyer.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Screenshots

| File | Shows |
| --- | --- |
| `landing-desktop.png`, `landing-desktop-full.png` | Landing page, first screen and full page |
| `landing-mobile.png`, `landing-mobile-full.png` | Landing page on a phone |
| `opt-in-desktop.png`, `opt-in-desktop-full.png`, `opt-in-mobile.png`, `opt-in-mobile-full.png` | Text message opt-in page |
| `opt-in-form-filled.png` | Opt-in form completed, consent box checked |
| `opt-in-review.png` | Review summary after the opt-in form |
| `request-form-text-consent.png` | Optional text consent box on the customer request form |
| `provider-form-text-consent.png` | Optional text consent box on the provider form |
| `terms-of-service-desktop.png`, `terms-of-service-mobile.png` | Terms of Service |
| `privacy-policy-desktop.png`, `privacy-policy-mobile.png` | Privacy Policy |
