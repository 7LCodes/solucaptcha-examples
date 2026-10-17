# Contributing

English and Portuguese contributions are welcome. Open issues for reproducible example bugs or documentation improvements; account and billing support belongs on the website.

1. Fork and clone the repository.
2. Use Node.js 22+ and Python 3.11+; no runtime dependencies are required.
3. Keep real API credentials, cookies, solutions and customer data out of commits and issues.
4. Run the commands below. Tests must remain isolated and must not create real tasks or spend credits.
5. Open a pull request describing the change and validation.

```bash
npm test
python -m unittest discover -s tests/python -v
node tools/build-guides.mjs --check
node tools/check-repository.mjs
```

Guide content lives in `tools/guide-source.mjs`. Edit that source, then run `npm run guides` to rebuild the Markdown guides and `generated/site-guides.json`. Do not edit generated guides independently. Website guides are synchronized from the generated JSON after review.

Keep public examples limited to documented public endpoints. Do not add automatic retries for task creation or publish claims about success rate, capacity or pricing without verifiable evidence.
