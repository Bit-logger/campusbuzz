## 2025-02-18 - Avoid committing automatically generated lockfiles

**Learning:** Running `pnpm install` as part of a pre-commit check or verification step can automatically generate lockfiles (like `pnpm-lock.yaml`) in a codebase that wasn't previously managing them, expanding PR scope massively and polluting diffs.
**Action:** Be mindful of automatically generated files (like lockfiles) when running package managers or build scripts. Explicitly clean them up (`git restore --staged pnpm-lock.yaml && rm pnpm-lock.yaml`) before committing to keep the PR focused and under the 50 lines constraint.
