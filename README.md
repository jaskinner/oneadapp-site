# oneadapp-site

Static marketing page for https://oneadapp.com/.

It is deployed on Netlify from the `main` branch. The site is a single `index.html` at the repo root, which is the publish directory. There is no build step.

The homepage describes what oneAD does today. Beta requests use a Netlify Form named `beta-access` (name, email, and production type). Submissions land in the Netlify forms dashboard. Set the form notification to hi@skinnerconsulting.tech in the Netlify UI; the page does not choose a recipient.

Visual design tokens and the theme spec are in [THEME.md](THEME.md).

Intentional homepage copy changes must regenerate [scripts/copy-baseline.txt](scripts/copy-baseline.txt) with `node scripts/check-copy.mjs --write` and commit that file.

The social share image is `og-image.png` (1200×630), referenced by the `og:image` and `twitter:image` tags in `index.html`. Its source is [scripts/og/og-image.html](scripts/og/og-image.html). After editing it, run `node scripts/render-og-image.mjs` (needs Google Chrome; set `CHROME` to use another path) and commit both files. If the image changes, refresh LinkedIn's cache with the Post Inspector.
