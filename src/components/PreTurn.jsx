import { TEAM_COLORS } from './Setup';

export default function PreTurn({ teams, currentTeamIndex, currentRound, numRounds, onBegin, scores }) {
  const team = teams[currentTeamIndex];
  const color = TEAM_COLORS[currentTeamIndex % TEAM_COLORS.length];

  return (
    <div className="preturn-screen">
      <div className="preturn-round-badge">
        Round {currentRound} of {numRounds}
      </div>

      <div className="preturn-card" style={{ borderColor: color }}>
        <div className="preturn-team-color" style={{ background: color }} />
        <h2 className="preturn-team-name" style={{ color }}>
          {team}
        </h2>
        <p className="preturn-instruction">
          Pass the device to <strong>{team}</strong>'s clue giver.
        </p>
        <p className="preturn-hint">
          Describe the word without saying any of the taboo words!
        </p>
      </div>

      <div className="scoreboard-preview">
        <h3 className="scores-title">Current Scores</h3>
        <div className="scores-list">
          {teams.map((t, i) => (
            <div key={i} className="score-item">
              <span className="score-dot" style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }} />
              <span className="score-name">{t}</span>
              <span className="score-value">{scores[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="begin-btn"
        style={{ background: color }}
        onClick={onBegin}
      >
        BEGIN TURN
      </button>
    </div>
  );
}
