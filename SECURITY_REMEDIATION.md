# Security Remediation — Manual Actions Required

This document records the out-of-band actions that must be completed by a
human after the security housekeeping commits on `release/v0.2.0`. The
automated work (removing the committed credentials file, gitignoring env
files, applying `npm audit fix`, deduplicating the lucide icon library)
has already been committed, but the following items cannot be safely
performed by an agent.

## 1. Rotate PayFast credentials (CRITICAL — do first)

The file `BACKEND_CREDENTIALS.md` (now removed from the working tree but
still present in git history) contained:

- PayFast Merchant ID
- PayFast Merchant Key
- PayFast Passphrase

Even after the history rewrite below, you must assume these values are
compromised because they were pushed to the remote.

Steps:

1. Sign in to the PayFast merchant portal: <https://merchant.payfast.io>
2. Navigate to **Settings → Integration**.
3. Regenerate the **Merchant Key**.
4. Regenerate (or rotate) the **Passphrase**.
5. Update the new values in:
   - AWS Secrets Manager (or wherever the backend reads PayFast config)
   - The backend `.env.production` / `.env.uat`
   - Any local `.env` files developers use
6. Redeploy the backend so the new credentials take effect.
7. Confirm a successful test transaction in the PayFast sandbox before
   announcing the rotation as complete.

## 2. Rewrite git history to purge `BACKEND_CREDENTIALS.md`

The file has been removed in commit on `release/v0.2.0`, but the secrets
are still recoverable from prior commits. To purge them from history,
run (from a clean clone, on a fresh checkout):

```bash
# Install git-filter-repo first if needed: brew install git-filter-repo
git filter-repo --path BACKEND_CREDENTIALS.md --invert-paths
```

Then force-push every affected branch:

```bash
git push --force-with-lease origin --all
git push --force-with-lease origin --tags
```

**Warnings:**

- Force-push will rewrite the SHAs of every commit that ever touched
  the repo. Coordinate with anyone who has the repo cloned — they will
  need to re-clone or `git fetch && git reset --hard origin/<branch>`.
- Do **not** run this against `master`/`main` without team consent and a
  fresh backup of the remote.
- Open PRs that target a rewritten branch will need to be recreated.
- GitHub caches blobs for up to 90 days; even after the rewrite the
  blob may still be reachable via the raw SHA URL. This is why
  rotation (step 1) is non-negotiable.

## 3. Notify teammates

Anyone who has `release/v0.2.0` (or `master`) checked out locally needs
to be told:

- That `BACKEND_CREDENTIALS.md` has been deleted (it must not be
  re-committed).
- That git history will be rewritten — they should stash work, re-fetch,
  and rebase.
- That the PayFast credentials have been rotated, so any local `.env`
  files referencing the old key/passphrase will need updating.

## 4. CloudFront Response Headers Policy

A security headers policy (HSTS, X-Content-Type-Options, Referrer-Policy,
Permissions-Policy, CSP) must be attached to the CloudFront distribution
that fronts this site. This is being handled in parallel by another
agent (F4). If after merging it is still not in place, attach an
appropriate policy in the AWS CloudFront console:

1. Open the distribution for the site.
2. Edit the default behaviour.
3. Set **Response headers policy** to a managed or custom policy that
   includes:
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - A Content-Security-Policy appropriate for the site
4. Deploy and verify with `curl -I https://ayandamabaso.com`.

## 5. Remaining low-severity CVEs (informational)

After running `npm audit fix`, 6 low-severity advisories remain. All of
them are transitive `cookie <0.7.0` advisories pulled in via
`@sveltejs/kit`. `npm audit fix --force` would resolve them by
downgrading `@sveltejs/kit` to `0.0.30`, which is a breaking change and
not viable. The proper fix is to upgrade `@sveltejs/kit` once an
upstream release ships a non-vulnerable `cookie` dependency. Track and
re-audit on each dependency bump.

## Status checklist

- [x] `BACKEND_CREDENTIALS.md` removed from the working tree
- [x] `.gitignore` covers all `.env*` files (kept `.env.example`)
- [x] `npm audit fix` applied; 9 vulns → 6 low
- [x] `lucide-svelte` removed; standardized on `@lucide/svelte`
- [ ] PayFast credentials rotated (manual — see step 1)
- [ ] git history rewritten and force-pushed (manual — see step 2)
- [ ] Team notified (manual — see step 3)
- [ ] CloudFront response headers policy attached (F4 / manual — see step 4)
- [ ] `@sveltejs/kit` upgraded to a release with non-vulnerable `cookie` (future)
