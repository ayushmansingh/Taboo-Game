import { TEAM_COLORS } from './Setup';

export default function TurnSummary({ teams, currentTeamIndex, results, skipPenalty, onNext, isLastTurn }) {
  const team = teams[currentTeamIndex];
  const color = TEAM_COLORS[currentTeamIndex % TEAM_COLORS.length];

  const correct = results.filter((r) => r.result === 'correct');
  const taboos = results.filter((r) => r.result === 'taboo');
  const skips = results.filter((r) => r.result === 'skip');
  const turnScore = correct.length - taboos.length - (skipPenalty ? skips.length : 0);

  return (
    <div className="summary-screen">
      <div className="summary-header" style={{ borderColor: color }}>
        <div className="summary-team-dot" style={{ background: color }} />
        <h2 className="summary-team-name" style={{ color }}>{team}</h2>
        <p className="summary-subtitle">Turn Summary</p>
      </div>

      <div className="summary-score-banner" style={{ background: color }}>
        <span className="summary-score-label">Points This Turn</span>
        <span className="summary-score-value">{turnScore > 0 ? '+' : ''}{turnScore}</span>
      </div>

      <div className="summary-stats">
        <div className="stat-card correct-stat">
          <span className="stat-icon">✓</span>
          <span className="stat-count">{correct.length}</span>
          <span className="stat-label">Correct</span>
        </div>
        <div className="stat-card taboo-stat">
          <span className="stat-icon">🚫</span>
          <span className="stat-count">{taboos.length}</span>
          <span className="stat-label">Taboo</span>
        </div>
        <div className="stat-card skip-stat">
          <span className="stat-icon">↷</span>
          <span className="stat-count">{skips.length}</span>
          <span className="stat-label">Skipped</span>
        </div>
      </div>

      {results.length > 0 && (
        <div className="summary-results-list">
          <h3 className="results-list-title">Cards This Turn</h3>
          <div className="results-scroll">
            {results.map((r, i) => (
              <div key={i} className={`result-row result-${r.result}`}>
                <span className="result-icon">
                  {r.result === 'correct' ? '✓' : r.result === 'taboo' ? '🚫' : '↷'}
                </span>
                <span className="result-word">{r.word}</span>
                <span className="result-label">{r.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="next-btn" style={{ background: color }} onClick={onNext}>
        {isLastTurn ? 'SEE FINAL SCORES' : 'NEXT TEAM →'}
      </button>
    </div>
  );
}
