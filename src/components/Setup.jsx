import { useState } from 'react';

const MIN_TEAMS = 2;
const MAX_TEAMS = 6;

export default function Setup({ onStart }) {
  const [teams, setTeams] = useState(['Team 1', 'Team 2']);
  const [timerDuration, setTimerDuration] = useState(60);
  const [numRounds, setNumRounds] = useState(3);
  const [skipPenalty, setSkipPenalty] = useState(false);

  const addTeam = () => {
    if (teams.length < MAX_TEAMS) {
      setTeams([...teams, `Team ${teams.length + 1}`]);
    }
  };

  const removeTeam = (index) => {
    if (teams.length > MIN_TEAMS) {
      setTeams(teams.filter((_, i) => i !== index));
    }
  };

  const updateTeamName = (index, name) => {
    const updated = [...teams];
    updated[index] = name;
    setTeams(updated);
  };

  const handleStart = () => {
    const cleanedTeams = teams.map((t, i) => t.trim() || `Team ${i + 1}`);
    onStart({ teams: cleanedTeams, timerDuration, numRounds, skipPenalty });
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <div className="logo-area">
          <span className="logo-icon">🚫</span>
          <h1 className="game-title">TABOO</h1>
          <p className="game-subtitle">The word guessing game</p>
        </div>
      </div>

      <div className="setup-body">
        <div className="setup-card">
          <h2 className="section-title">Teams</h2>
          <div className="teams-list">
            {teams.map((team, index) => (
              <div key={index} className="team-row">
                <div className="team-color-dot" style={{ background: TEAM_COLORS[index % TEAM_COLORS.length] }} />
                <input
                  className="team-input"
                  type="text"
                  value={team}
                  onChange={(e) => updateTeamName(index, e.target.value)}
                  placeholder={`Team ${index + 1}`}
                  maxLength={20}
                />
                {teams.length > MIN_TEAMS && (
                  <button className="remove-team-btn" onClick={() => removeTeam(index)} aria-label="Remove team">
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {teams.length < MAX_TEAMS && (
            <button className="add-team-btn" onClick={addTeam}>
              + Add Team
            </button>
          )}
        </div>

        <div className="setup-card">
          <h2 className="section-title">Settings</h2>

          <div className="setting-row">
            <label className="setting-label">Timer</label>
            <div className="option-group">
              {[30, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  className={`option-btn ${timerDuration === sec ? 'active' : ''}`}
                  onClick={() => setTimerDuration(sec)}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <label className="setting-label">Rounds</label>
            <div className="option-group">
              {[3, 5, 7, 10].map((r) => (
                <button
                  key={r}
                  className={`option-btn ${numRounds === r ? 'active' : ''}`}
                  onClick={() => setNumRounds(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <label className="setting-label">Skip Penalty</label>
            <button
              className={`toggle-btn ${skipPenalty ? 'active' : ''}`}
              onClick={() => setSkipPenalty(!skipPenalty)}
            >
              {skipPenalty ? 'ON (-1 pt)' : 'OFF'}
            </button>
          </div>
        </div>

        <button className="start-btn" onClick={handleStart}>
          START GAME
        </button>
      </div>
    </div>
  );
}

export const TEAM_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'
];
