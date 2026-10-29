# Security policy

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/thenamespace/ens-components/security/advisories/new)
to contact the maintainers when the report form is enabled. If the form is
unavailable, ask a repository administrator to enable private vulnerability
reporting, or use the contact links on [Namespace](https://namespace.ninja) to
request a private reporting channel. Keep exploit details out of public issues,
public chats, and pull requests until a fix is available.

Include the package version, affected component, chain, reproduction steps, and
expected and observed behavior. Remove wallet keys, API tokens, authenticated
RPC URLs, and other credentials from examples and logs. Use accounts you control
on a local chain or testnet when reproducing a problem.

## Scope and fixes

Report issues in wallet requests, transaction construction, permissions, record
editing, image uploads, dependencies, or package publishing. For an issue in an
upstream service or contract, report it to that project's maintainers too.

Security fixes target the latest stable release. Older versions do not have a
guaranteed backport policy. Maintainers will coordinate a fix and disclosure
privately; this policy does not promise a response deadline or a bounty.
