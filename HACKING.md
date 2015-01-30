Hacking on Legalize.js
======================

Legalize.js is fairly well documented so you should be able to just start hacking.
Please check all changes using `grunt`, which has thresholds defined for code coverage
and checks the format of your files.

Worth mentioning:
- `legalize.js` in the root directory is a generated source but committed to the
  repository (this is to distribute the browser version via bower).
- `src/legalize-browser.js` only contains browser specific tweaks such as shims
  needed to make it compatible with various browsers out there.


