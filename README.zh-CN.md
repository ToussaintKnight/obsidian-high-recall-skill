# Obsidian High Recall for Codex

语言：[English](README.md) | [中文](README.zh-CN.md)

这是一个可移植的 Codex skill，用于对本地 Obsidian vault 做高召回检索。

它适合“漏掉相关笔记比多返回噪声更糟”的场景。默认优先复用 Smart Connections 的本地向量索引；如果没有 Smart Connections 索引，则回退到 `obsidian-hybrid-search`。

## 它能做什么

- 从 Obsidian app config 自动发现当前 vault。
- 读取 Smart Connections 已生成的 `.smart-env` 本地向量。
- 通过 `npx` 回退调用 `obsidian-hybrid-search`。
- 支持 `auto`、`smart`、`ohs`、`both` 四种 backend。
- 返回带 snippet、channel、score、rank 的高召回结果包，也支持 JSON 输出。
- 派生索引和运行时依赖放在 vault 外部，不污染笔记库。

## 环境要求

- Codex Desktop，或其他支持本地 skills 的 Codex 环境。
- Node.js 在 `PATH` 上可用。
- 本地磁盘上的 Obsidian vault。
- 推荐安装并完成索引：Obsidian Smart Connections 插件。

首次运行可能会下载 npm/Hugging Face 依赖用于本地推理。这个 skill 不会主动上传 vault 内容；依赖可用后，检索和 embedding 推理都在本地执行。

## 安装

### 在 Codex 里从 GitHub 安装

对 Codex 说：

```text
Use $skill-installer to install https://github.com/ToussaintKnight/obsidian-high-recall-skill/tree/main/skills/obsidian-high-recall
```

安装后重启 Codex。

### 手动安装

Windows PowerShell:

```powershell
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item ".\obsidian-high-recall-skill\skills\obsidian-high-recall" "$env:USERPROFILE\.codex\skills\" -Recurse
```

macOS/Linux:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
mkdir -p ~/.codex/skills
cp -R ./obsidian-high-recall-skill/skills/obsidian-high-recall ~/.codex/skills/
```

然后重启 Codex。

## 在 Codex 里使用

直接问：

```text
Use $obsidian-high-recall to find a high-recall pack for "数据采集 for 具身".
```

如果需要最大召回：

```text
Use $obsidian-high-recall with backend both and limit 200 for "机器人基础模型 演示数据 遥操作 轨迹 采集".
```

## 命令行使用

进入已安装的 skill 目录：

```bash
node scripts/obsidian_high_recall.mjs detect
node scripts/obsidian_high_recall.mjs status
node scripts/obsidian_high_recall.mjs query "数据采集 for 具身" --backend auto --limit 120 --json
node scripts/obsidian_high_recall.mjs query "机器人 遥操作 演示数据" --backend both --limit 200 --per-channel 80 --json
```

如果自动发现 vault 失败：

```bash
node scripts/obsidian_high_recall.mjs query "my query" --vault "/absolute/path/to/your-vault" --json
```

## Backend 怎么选

- `auto`：有 Smart Connections `.smart-env` 时优先用 Smart，否则用 OHS。
- `smart`：使用 Smart Connections 本地 embedding，并加 lexical fallback。
- `ohs`：使用 `obsidian-hybrid-search` 的 hybrid/fulltext 检索。
- `both`：合并 Smart 和 OHS 结果；召回最好，但更慢。

推荐：

- 日常使用：`--backend auto --limit 120`
- 高风险/高召回任务：`--backend both --limit 200`
- 做评估：用 evaluator 比较 `smart` 和 `ohs`

## Benchmark Snapshot

这是一个小规模 private-vault retrieval benchmark，用来测试这套部署方式的召回行为，不代表所有 Obsidian vault 的普遍结论。原始 note path、snippet 和 gold note 标识没有公开；repo 里只放 aggregate metrics 和匿名 case-level data。

早期 3-task pilot 结果归档在 [pilot_smoke_test.md](docs/benchmark/pilot_smoke_test.md)；下面的 8-task benchmark 是主结果。

**实验设置。** Vault snapshot 包含 255 个 Smart Connections files、6,220 个 Smart blocks、1,478 个 embedded blocks。Smart backend 使用 `TaylorAI/bge-micro-v2` embedding。OHS backend 使用 `obsidian-hybrid-search` `0.13.16`、`local:Xenova/multilingual-e5-small`，共 244 个 indexed files、1,450 个 chunks。每次运行固定 `limit=80`、`per-channel=30`、`neighbor-seeds=0`，评估 K=10/20/50。完整设置见：[settings.json](docs/benchmark/settings.json)。

**数据。** 评估集包含 8 个手工标注 recall tasks，共 53 个 gold labels。Query 语言分布为 1 个中文 query、1 个中英混合 query、6 个英文 query，覆盖 embodied data、robot demonstrations、world models、spatial perception、tactile manipulation、humanoid robotics、JEPA/world-model notes、AI productivity tooling。

**Ablations。** 实验比较 3 个条件：Smart Connections recall (`smart`)、OHS hybrid/fulltext recall (`ohs`)、以及对 Smart 和 OHS 排名结果做 reciprocal-rank-fusion 的可部署 union (`rrf-union`)。完整 aggregate data 见：[summary_metrics.csv](docs/benchmark/summary_metrics.csv)。匿名 case-level metrics 见：[case_metrics_at20.csv](docs/benchmark/case_metrics_at20.csv)。

**K=20 主要结果。**

| condition | Precision@20 | Recall@20 | F1@20 | MRR | mean latency |
|---|---:|---:|---:|---:|---:|
| Smart | 0.20 | 0.61 | 0.30 | 0.68 | 1.40s |
| OHS | 0.19 | 0.55 | 0.28 | 0.25 | 54.84s |
| RRF union | 0.22 | 0.65 | 0.32 | 0.52 | 56.24s |

在 K=50 时，本轮实验 Smart 的 mean recall 最高：Smart `0.91`、OHS `0.72`、RRF union `0.85`。RRF union 在 K=20 更强；Smart 则明显更快，并且 first-hit behavior 更好。

**参数敏感性。** 上面的固定 operating point 不代表最优参数。我们额外做了 Smart-only sensitivity grid：扫 `per-channel ∈ {10,30,60,100}` 和 `neighbor-seeds ∈ {0,10,25,50}`，固定 `limit=120`，并评估 K=10/20/50/80/120。完整数据见：[sensitivity_smart_grid.csv](docs/benchmark/sensitivity_smart_grid.csv)、[sensitivity_smart_at50.csv](docs/benchmark/sensitivity_smart_at50.csv)、[sensitivity_settings.json](docs/benchmark/sensitivity_settings.json)。

在 K=50 时，`per-channel=10` 和 `per-channel=30` 都达到 mean Recall `0.91`，但 `per-channel=10` 的 F1 更高（`0.29` vs `0.23`），阅读负担更低（35 vs 47 个返回结果）。更宽的 candidate pool 并不单调更好：`per-channel=60/100` 把 Recall@50 降到 `0.80/0.81`，同时返回 86/118 个结果。把 K 提高到 120 可以让 `per-channel=60/100` 的 Recall 恢复到 `1.00`，但 Precision 会降到 `0.077/0.056`。在这个 snapshot 里，`neighbor-seeds` 没有可测的 aggregate effect。

![Benchmark summary at K=20](docs/benchmark/figures/summary_at20.png)

![Average recall curve](docs/benchmark/figures/recall_curve.png)

![Recall by task](docs/benchmark/figures/recall_by_case_at20.png)

![Latency by condition](docs/benchmark/figures/latency_by_condition.png)

![Recall heatmap at K=20](docs/benchmark/figures/recall_heatmap_at20.png)

![Smart sensitivity tradeoff matrix](docs/benchmark/figures/sensitivity_tradeoff_matrix_at50.png)

![Smart read-budget tradeoff curves](docs/benchmark/figures/sensitivity_k_tradeoff_curves.png)

![Smart recall vs read burden](docs/benchmark/figures/sensitivity_read_burden_pareto_at50.png)

**局限性。** Gold set 很小，而且是人工 seed 的，所以 Precision@K 偏保守：没有被标为 gold 但实际有用的 notes 会被算成 false positives。Vault 是 private 且 domain-skewed，所以这些结果更适合作为当前部署模式的 robustness smoke test。实际使用建议是：日常用 Smart/`auto`，只有在能接受额外延迟的 high-stakes recall 任务里才用 union/OHS。

## 召回评估

先创建 cases 文件：

```json
[
  {
    "id": "my-topic",
    "query": "这个 topic 的宽泛自然语言 query",
    "gold": [
      "已知相关笔记标题",
      "folder/or/path-substring"
    ]
  }
]
```

运行：

```bash
node scripts/evaluate_recall.mjs ./obsidian_recall_eval --cases ./cases.json
```

输出：

- `raw_runs.json`
- `metrics.json`
- `metrics.csv`

指标包括 Precision@K、Recall@K、F1@K、MRR、gold note rank、返回数量和 `smart`/`ohs` 延迟。

## Repo 结构

```text
skills/
  obsidian-high-recall/
    SKILL.md
    agents/openai.yaml
    references/
    scripts/
```

## License

MIT
