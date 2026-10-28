# oneadapp-site

Static marketing page for https://oneadapp.com/.

It is deployed on Netlify from the `main` branch. The site is a single `index.html` at the repo root, which is the publish directory. There is no build step.

The homepage describes what oneAD does today. Beta requests use a Netlify Form named `beta-access` (name, email, and production type). Submissions land in the Netlify forms dashboard. Set the form notification to hi@skinnerconsulting.tech in the Netlify UI; the page does not choose a recipient.

Visual design tokens and the theme spec are in [THEME.md](THEME.md).
