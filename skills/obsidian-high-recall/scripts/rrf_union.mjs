export function makeRrfUnion(runs, rrfK = 60) {
  const records = new Map();
  for (const run of runs) {
    const results = run.json?.results || [];
    results.forEach((result, idx) => {
      const rank = idx + 1;
      const key = result.path || result.title || `${run.backend}-${idx}`;
      if (!records.has(key)) {
        records.set(key, {
          ...result,
          channels: [],
          channelRanks: {},
          matchedBy: [],
          rrfScore: 0,
        });
      }
      const rec = records.get(key);
      rec.rrfScore += 1 / (rrfK + rank);
      rec.channels = unique([...(rec.channels || []), run.backend, ...(result.channels || [])]);
      rec.matchedBy = unique([...(rec.matchedBy || []), ...(result.matchedBy || [])]);
      rec.channelRanks = { ...(rec.channelRanks || {}), [run.backend]: rank };
      rec.bestScore = Math.max(Number(rec.bestScore || 0), Number(result.bestScore || result.score || 0));
      rec.bestRank = Math.min(Number(rec.bestRank || rank), Number(result.bestRank || rank));
      rec.snippet ||= result.snippet || null;
      rec.title ||= result.title || null;
    });
  }
  const merged = [...records.values()]
    .sort((a, b) => b.rrfScore - a.rrfScore || (a.bestRank || 999999) - (b.bestRank || 999999))
    .map((result, idx) => ({
      ...result,
      rank: idx + 1,
      recallScore: Number((result.rrfScore * 1000).toFixed(3)),
      rrfScore: Number(result.rrfScore.toFixed(6)),
    }));

  return {
    query: runs[0]?.json?.query || null,
    generatedAt: new Date().toISOString(),
    backend: {
      selected: "rrf-union",
      primary: "smart+ohs",
      package: "derived by evaluator",
    },
    channels: runs.map((run) => ({ channel: run.backend, count: run.json?.results?.length || 0 })),
    results: merged,
    resultCountBeforeLimit: merged.length,
  };
}

function unique(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    if (!value) continue;
    const key = String(value).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
