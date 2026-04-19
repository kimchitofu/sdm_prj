The local development DB `dev.db` should be removed from the repository history/index and ignored.

If `dev.db` is already tracked in your branch, run locally:

```bash
# remove from git index but keep file on disk
git rm --cached Working/dev.db
# commit the change
git commit -m "Remove dev.db from repository and ignore it"
# push the branch
git push
```

This repository change already added `dev.db` to `Working/.gitignore` so future commits will not include it.
