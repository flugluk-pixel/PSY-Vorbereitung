# Changelog

## 2026-04-20

### Scoring and Interpretation
- Fixed reaction-time evaluation in test mode for slower visual modules by scaling RT validity thresholds per module via `rtMultiplier` instead of using a global 1000 ms cutoff.
- Added module-specific component weighting in scoring so fast reaction modules emphasize `speed`, while more complex visual modules emphasize `accuracy` and `consistency`.
- Made interpretation copy context-aware by module type (fast reaction vs. complex visual tasks).
- Extended analytics reaction-profile text to be context-aware for speed, stability, and accuracy summaries.
- Fixed a critical zone-scoring edge case in `scoreFromZones(...)` where open-ended zone bounds could produce `NaN`, causing high-performance components (for example `speed`, `consistency`, or `memory`) to disappear.

### Validation
- Re-ran smoke tests (`tests/run-smoke-test.ps1`) with all flows passing.
- Added targeted engine-level repro checks for extreme fast RT and memory-zone edge cases.
