# Releasing the Tag family

How to publish TagBrush.css, TagAction, TagCheck, and TagKit to npm. The Jekyll theme (kovirlabs/tagkit-jekyll) isn't on npm; sites use it straight from GitHub with `remote_theme`.

| Folder | npm package | Command it installs |
| --- | --- | --- |
| `tagbrush/` | `tagbrush` | `tagbrush` |
| `tagaction/` | `tagaction` | (none: a script for pages) |
| `tagcheck/` | `@kovirlabs/tagcheck` | `tagcheck` |
| `tagkit/` | `@kovirlabs/tagkit` | `tagkit` |

The unscoped names `tagcheck` and `tagkit` on npm belong to other people, which is why those two are scoped. Never tell anyone to run `npx tagcheck` or `npx tagkit`.

## One-time setup

1. Log in as the account that owns the packages: `npm login` (opens the browser). Check with `npm whoami`.
2. The `@kovirlabs` packages need the `kovirlabs` organization on npm (npmjs.com → your avatar → Add Organization; the free plan is enough for public packages). Check with `npm org ls kovirlabs`.

If `npm publish` says **404 Not Found**, npm isn't accepting your login for that package: the saved token has expired or only covers other packages. Run `npm login` again, or make a granular token with read and write on all packages and the `kovirlabs` organization.

## Publish

Each package is independent; publish in any order and don't wait for one to clear npm's review before the next. Each command runs the tests first.

```sh
cd ~/github/tagstack/tagaction && npm test && npm publish
cd ~/github/tagstack/tagcheck  && npm test && npm publish
cd ~/github/tagstack/tagkit    && npm test && npm publish
cd ~/github/tagstack/tagbrush  && npm test && npm publish
```

Scoped packages are public because their `package.json` sets `"publishConfig": { "access": "public" }`. If you have two-factor authentication, npm asks for a code.

To see what would be published without publishing: `npm pack --dry-run`.

## A new version

1. Update the version: `npm version patch` (or `minor`, `major`) in the package's folder. This commits and tags `vX.Y.Z`.
2. For TagBrush and TagAction, run `npm run build` so the files carry the new version, and commit.
3. Move the CHANGELOG's "Unreleased" entries under the new version and today's date.
4. Push the commit and the tag: `git push && git push --tags`.
5. Publish as above.
6. For TagAction, update "Tested with TagBrush.css …" in the README and CHANGELOG if TagBrush changed.

## Check that it worked

```sh
npm view tagaction version
npm view @kovirlabs/tagcheck version
npm view @kovirlabs/tagkit version
curl -sI https://cdn.jsdelivr.net/npm/tagaction@0/tagaction.min.js | head -1   # jsDelivr can take a few minutes
npx @kovirlabs/tagcheck --version
```

The CDN lines in every guide use the major version (`tagbrush@2`, `tagaction@0`), so pages pick up new minor and patch releases without changes.
