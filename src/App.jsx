import { useState, useCallback, useEffect } from 'react';
import Setup from './components/Setup';
import PreTurn from './components/PreTurn';
import Game from './components/Game';
import TurnSummary from './components/TurnSummary';
import EndGame from './components/EndGame';
import ResumeDialog from './components/ResumeDialog';
import { wordCards } from './data/words';
import './App.css';

const SAVE_KEY = 'taboo-game-state';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state?.phase || !state?.teams?.length) return null;
    return state;
  } catch {
    return null;
  }
}

function clearSavedState() {
  localStorage.removeItem(SAVE_KEY);
}

const PHASES = {
  SETUP: 'setup',
  RESUME: 'resume',
  PRE_TURN: 'preTurn',
  PLAYING: 'playing',
  TURN_SUMMARY: 'turnSummary',
  END_GAME: 'endGame',
};

export default function App() {
  const [phase, setPhase] = useState(() => {
    const saved = loadSavedState();
    return saved ? PHASES.RESUME : PHASES.SETUP;
  });

  const [savedState] = useState(() => loadSavedState());
  const [settings, setSettings] = useState(null);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [wordQueue, setWordQueue] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [lastTurnResults, setLastTurnResults] = useState([]);

  // Persist game state to localStorage whenever key state changes
  useEffect(() => {
    if (!settings || [PHASES.SETUP, PHASES.RESUME, PHASES.END_GAME].includes(phase)) return;
    // If timer is running mid-turn, save as preTurn so they restart the turn fresh
    const savePhase = phase === PHASES.PLAYING ? PHASES.PRE_TURN : phase;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      phase: savePhase,
      settings,
      teams,
      scores,
      currentTeamIndex,
      currentRound,
      cardIndex,
    }));
  }, [phase, scores, cardIndex, currentTeamIndex, currentRound, settings, teams]);

  const initGame = useCallback(({ teams: teamNames, timerDuration, numRounds, skipPenalty }, fromSaved = false, savedScores = null, savedCardIndex = 0, savedTeamIndex = 0, savedRound = 1) => {
    setTeams(teamNames);
    setScores(savedScores ?? new Array(teamNames.length).fill(0));
    setSettings({ timerDuration, numRounds, skipPenalty });
    setCurrentTeamIndex(savedTeamIndex);
    setCurrentRound(savedRound);
    setWordQueue(shuffle(wordCards));
    setCardIndex(savedCardIndex);
    setPhase(fromSaved ? PHASES.PRE_TURN : PHASES.PRE_TURN);
  }, []);

  const handleStart = useCallback(({ teams: teamNames, timerDuration, numRounds, skipPenalty }) => {
    clearSavedState();
    setTeams(teamNames);
    setScores(new Array(teamNames.length).fill(0));
    setSettings({ timerDuration, numRounds, skipPenalty });
    setCurrentTeamIndex(0);
    setCurrentRound(1);
    setWordQueue(shuffle(wordCards));
    setCardIndex(0);
    setPhase(PHASES.PRE_TURN);
  }, []);

  const handleResume = useCallback(() => {
    const s = savedState;
    setTeams(s.teams);
    setScores(s.scores);
    setSettings(s.settings);
    setCurrentTeamIndex(s.currentTeamIndex);
    setCurrentRound(s.currentRound);
    setWordQueue(shuffle(wordCards));
    setCardIndex(s.cardIndex ?? 0);
    setPhase(s.phase);
  }, [savedState]);

  const handleDiscardAndNew = useCallback(() => {
    clearSavedState();
    setPhase(PHASES.SETUP);
  }, []);

  const handleBeginTurn = useCallback(() => {
    setPhase(PHASES.PLAYING);
  }, []);

  const handleTurnEnd = useCallback((results, nextCardIndex) => {
    const correct = results.filter((r) => r.result === 'correct').length;
    const taboos = results.filter((r) => r.result === 'taboo').length;
    const skips = results.filter((r) => r.result === 'skip').length;
    const turnScore = correct - taboos - (settings.skipPenalty ? skips : 0);

    setScores((prev) => {
      const updated = [...prev];
      updated[currentTeamIndex] = Math.max(0, updated[currentTeamIndex] + turnScore);
      return updated;
    });

    setLastTurnResults(results);

    if (nextCardIndex >= wordQueue.length) {
      setWordQueue(shuffle(wordCards));
      setCardIndex(0);
    } else {
      setCardIndex(nextCardIndex);
    }

    setPhase(PHASES.TURN_SUMMARY);
  }, [currentTeamIndex, settings, wordQueue.length]);

  const isLastTurn = () => {
    return currentTeamIndex === teams.length - 1 && currentRound === settings.numRounds;
  };

  const handleNextTurn = useCallback(() => {
    if (isLastTurn()) {
      clearSavedState();
      setPhase(PHASES.END_GAME);
      return;
    }
    const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
    const nextRound = nextTeamIndex === 0 ? currentRound + 1 : currentRound;
    setCurrentTeamIndex(nextTeamIndex);
    setCurrentRound(nextRound);
    setPhase(PHASES.PRE_TURN);
  }, [currentTeamIndex, currentRound, teams.length, settings]);

  const handlePlayAgain = useCallback(() => {
    clearSavedState();
    setScores(new Array(teams.length).fill(0));
    setCurrentTeamIndex(0);
    setCurrentRound(1);
    setWordQueue(shuffle(wordCards));
    setCardIndex(0);
    setPhase(PHASES.PRE_TURN);
  }, [teams.length]);

  const handleNewGame = useCallback(() => {
    clearSavedState();
    setPhase(PHASES.SETUP);
  }, []);

  return (
    <div className="app">
      {phase === PHASES.RESUME && savedState && (
        <ResumeDialog
          savedState={savedState}
          onResume={handleResume}
          onNewGame={handleDiscardAndNew}
        />
      )}
      {phase === PHASES.SETUP && <Setup onStart={handleStart} />}
      {phase === PHASES.PRE_TURN && (
        <PreTurn
          teams={teams}
          currentTeamIndex={currentTeamIndex}
          currentRound={currentRound}
          numRounds={settings.numRounds}
          scores={scores}
          onBegin={handleBeginTurn}
        />
      )}
      {phase === PHASES.PLAYING && (
        <Game
          key={`${currentRound}-${currentTeamIndex}`}
          teams={teams}
          currentTeamIndex={currentTeamIndex}
          currentRound={currentRound}
          numRounds={settings.numRounds}
          wordQueue={wordQueue}
          cardIndex={cardIndex}
          timerDuration={settings.timerDuration}
          skipPenalty={settings.skipPenalty}
          onTurnEnd={handleTurnEnd}
        />
      )}
      {phase === PHASES.TURN_SUMMARY && (
        <TurnSummary
          teams={teams}
          currentTeamIndex={currentTeamIndex}
          results={lastTurnResults}
          skipPenalty={settings.skipPenalty}
          onNext={handleNextTurn}
          isLastTurn={isLastTurn()}
        />
      )}
      {phase === PHASES.END_GAME && (
        <EndGame
          teams={teams}
          scores={scores}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
