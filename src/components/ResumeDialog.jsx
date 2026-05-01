import { TEAM_COLORS } from './Setup';

export default function ResumeDialog({ savedState, onResume, onNewGame }) {
  const { teams, scores, currentRound, settings } = savedState;

  return (
    <div className="resume-screen">
      <div className="resume-card">
        <div className="resume-icon">⏸</div>
        <h2 className="resume-title">Game In Progress</h2>
        <p className="resume-subtitle">
          You have an unfinished game. Want to continue?
        </p>

        <div className="resume-game-info">
          <div className="resume-info-row">
            <span className="resume-info-label">Round</span>
            <span className="resume-info-value">{currentRound} of {settings.numRounds}</span>
          </div>
          <div className="resume-info-row">
            <span className="resume-info-label">Timer</span>
            <span className="resume-info-value">{settings.timerDuration}s</span>
          </div>
        </div>

        <div className="resume-scores">
          <p className="resume-scores-label">Scores</p>
          {teams.map((team, i) => (
            <div key={i} className="resume-score-row">
              <span className="resume-score-dot" style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }} />
              <span className="resume-score-name">{team}</span>
              <span className="resume-score-val" style={{ color: TEAM_COLORS[i % TEAM_COLORS.length] }}>
                {scores[i]}
              </span>
            </div>
          ))}
        </div>

        <button className="resume-btn-primary" onClick={onResume}>
          Continue Game
        </button>
        <button className="resume-btn-secondary" onClick={onNewGame}>
          Start New Game
        </button>
      </div>
    </div>
  );
}
