# External Contribution Strategy

This project can become a useful public artifact, but GitHub influence also depends on visible collaboration outside the user's own repositories. The missing signal called out in the critique was "No PR solved": there is little public evidence of entering another maintainer's project, understanding constraints, making a useful change, and getting accepted.

## Identity To Build

Scientist-engineer who turns advanced 3D/CV/AI research and agent workflows into reliable open tools that others can actually use.

That is stronger than trying to look like a generic GitHub power user.

## Adjacent Ecosystems

Target ecosystems should overlap with real expertise and with this repository's user base:

- Obsidian, PKM, and local-first AI tooling.
- Agent workflow tools around Codex, Claude Code, Gemini CLI, and vault-aware search.
- 3D/CV/robotics tooling such as Open3D, COLMAP, Nerfstudio, OpenMMLab, PyTorch3D, SLAM/robotics repos, and Gaussian-splatting tools.

## First PR Types

Start with low-risk maintainer-friendly work:

- reproduce and minimize an issue,
- fix broken install docs,
- add a small fixture or smoke test,
- improve benchmark scripts,
- document OS-specific setup,
- fix a numeric or parsing edge case,
- add privacy/security notes for local data workflows.

Avoid starting with large rewrites. The goal of the first 3-5 external PRs is not glory; it is to show reliable collaboration.

## Weekly Operating Loop

1. Pick one adjacent repo.
2. Read its contributing guide and recent issues.
3. Reproduce one bug or confusing setup path.
4. Comment with a minimal reproduction or diagnosis.
5. Submit a small PR with tests or docs.
6. Respond quickly and respectfully to review.
7. Link accepted work from the personal profile or project notes only after it is merged.

## How This Helps Obsidian High Recall

External PRs build trust that cannot be created by polishing this repo alone. Maintainers and users are more likely to trust a privacy-sensitive local search tool when its author has visible accepted work in adjacent ecosystems.

The near-term target is 3 accepted external PRs in adjacent tooling plus 20 serious users for this repo.
