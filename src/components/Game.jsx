import { useState, useEffect, useRef, useCallback } from 'react';
import { TEAM_COLORS } from './Setup';

export default function Game({
  teams,
  currentTeamIndex,
  currentRound,
  numRounds,
  wordQueue,
  cardIndex,
  timerDuration,
  skipPenalty,
  onTurnEnd,
}) {
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [localCardIndex, setLocalCardIndex] = useState(cardIndex);
  const [results, setResults] = useState([]);
  const [buzzAnimation, setBuzzAnimation] = useState(false);
  const [correctAnimation, setCorrectAnimation] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const intervalRef = useRef(null);
  const turnEndedRef = useRef(false);

  const team = teams[currentTeamIndex];
  const color = TEAM_COLORS[currentTeamIndex % TEAM_COLORS.length];
  const currentCard = wordQueue[localCardIndex];

  const endTurn = useCallback((finalResults, finalCardIndex) => {
    if (turnEndedRef.current) return;
    turnEndedRef.current = true;
    clearInterval(intervalRef.current);
    onTurnEnd(finalResults, finalCardIndex);
  }, [onTurnEnd]);

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft <= 0) {
      endTurn(results, localCardIndex);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timerStarted]);

  useEffect(() => {
    if (timeLeft === 0 && timerStarted) {
      endTurn(results, localCardIndex);
    }
  }, [timeLeft]);

  const startTimer = () => setTimerStarted(true);

  const recordResult = (result) => {
    if (!timerStarted) startTimer();
    const newResult = { word: currentCard.word, result };
    const newResults = [...results, newResult];
    setResults(newResults);

    if (result === 'taboo') {
      setBuzzAnimation(true);
      setTimeout(() => setBuzzAnimation(false), 500);
    } else if (result === 'correct') {
      setCorrectAnimation(true);
      setTimeout(() => setCorrectAnimation(false), 400);
    } else if (result === 'skip') {
      setSkipAnimation(true);
      setTimeout(() => setSkipAnimation(false), 400);
    }

    const nextIndex = localCardIndex + 1;
    if (nextIndex >= wordQueue.length) {
      endTurn(newResults, nextIndex);
    } else {
      setLocalCardIndex(nextIndex);
    }
  };

  const timerPct = (timeLeft / timerDuration) * 100;
  const timerColor =
    timeLeft > 20 ? '#2ecc71' : timeLeft > 10 ? '#f39c12' : '#e74c3c';

  const correctCount = results.filter((r) => r.result === 'correct').length;
  const tabooCount = results.filter((r) => r.result === 'taboo').length;
  const skipCount = results.filter((r) => r.result === 'skip').length;

  if (!currentCard) {
    return (
      <div className="game-screen">
        <p className="no-cards-msg">No more cards! Ending turn...</p>
      </div>
    );
  }

  return (
    <div className={`game-screen ${buzzAnimation ? 'buzz-shake' : ''}`}>
      <div className="game-header">
        <div className="game-team-badge" style={{ background: color }}>
          {team}
        </div>
        <div className="game-round-info">
          Round {currentRound}/{numRounds}
        </div>
        <div className="game-mini-scores">
          <span className="mini-correct">✓ {correctCount}</span>
          <span className="mini-skip">↷ {skipCount}</span>
          <span className="mini-taboo">✗ {tabooCount}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="timer-section">
        <div className="timer-display" style={{ color: timerColor }}>
          {timeLeft}
        </div>
        <div className="timer-bar-track">
          <div
            className="timer-bar-fill"
            style={{ width: `${timerPct}%`, background: timerColor }}
          />
        </div>
      </div>

      {/* Card */}
      <div className={`word-card ${correctAnimation ? 'card-correct' : ''} ${skipAnimation ? 'card-skip' : ''}`}>
        <div className="card-word">{currentCard.word}</div>
        <div className="taboo-divider">
          <span className="taboo-label">TABOO</span>
        </div>
        <ul className="taboo-list">
          {currentCard.taboo.map((t, i) => (
            <li key={i} className="taboo-item">
              <span className="taboo-x">✗</span> {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn taboo-btn"
          onClick={() => recordResult('taboo')}
          title="Clue giver said a taboo word"
        >
          <span className="btn-icon">🚫</span>
          <span className="btn-label">TABOO</span>
          <span className="btn-sub">-1 pt</span>
        </button>

        <button
          className="action-btn correct-btn"
          onClick={() => recordResult('correct')}
          title="Team guessed correctly"
        >
          <span className="btn-icon">✓</span>
          <span className="btn-label">GOT IT!</span>
          <span className="btn-sub">+1 pt</span>
        </button>

        <button
          className="action-btn skip-btn"
          onClick={() => recordResult('skip')}
          title="Skip this card"
        >
          <span className="btn-icon">↷</span>
          <span className="btn-label">SKIP</span>
          <span className="btn-sub">{skipPenalty ? '-1 pt' : '0 pts'}</span>
        </button>
      </div>

      {!timerStarted && (
        <div className="start-overlay" onClick={startTimer}>
          <div className="start-overlay-content">
            <p>Tap anywhere or press a button to start the timer</p>
          </div>
        </div>
      )}
    </div>
  );
}
