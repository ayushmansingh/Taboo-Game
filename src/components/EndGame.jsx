import { TEAM_COLORS } from './Setup';

export default function EndGame({ teams, scores, onPlayAgain, onNewGame }) {
  const ranked = teams
    .map((name, i) => ({ name, score: scores[i], color: TEAM_COLORS[i % TEAM_COLORS.length] }))
    .sort((a, b) => b.score - a.score);

  const topScore = ranked[0].score;
  const winners = ranked.filter((t) => t.score === topScore);
  const isTie = winners.length > 1;

  return (
    <div className="endgame-screen">
      <div className="winner-banner">
        <div className="trophy">🏆</div>
        {isTie ? (
          <>
            <h2 className="winner-label">It's a Tie!</h2>
            <div className="winner-names">
              {winners.map((w, i) => (
                <span key={i} className="winner-name" style={{ color: w.color }}>
                  {w.name}
                  {i < winners.length - 1 ? ' & ' : ''}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="winner-label">Winner!</h2>
            <div className="winner-name" style={{ color: ranked[0].color }}>
              {ranked[0].name}
            </div>
          </>
        )}
        <div className="winner-score">{topScore} points</div>
      </div>

      <div className="final-scoreboard">
        <h3 className="final-scores-title">Final Scores</h3>
        {ranked.map((team, index) => (
          <div
            key={index}
            className={`final-score-row ${index === 0 ? 'first-place' : ''}`}
          >
            <span className="place-badge">{index + 1}</span>
            <span className="final-team-dot" style={{ background: team.color }} />
            <span className="final-team-name">{team.name}</span>
            <span className="final-team-score" style={{ color: team.color }}>
              {team.score}
            </span>
            {index === 0 && !isTie && <span className="crown">👑</span>}
          </div>
        ))}
      </div>

      <div className="endgame-actions">
        <button className="play-again-btn" onClick={onPlayAgain}>
          PLAY AGAIN
        </button>
        <button className="new-game-btn" onClick={onNewGame}>
          NEW GAME
        </button>
      </div>
    </div>
  );
}
