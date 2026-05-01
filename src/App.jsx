import { useState, useCallback } from 'react';
import Setup from './components/Setup';
import PreTurn from './components/PreTurn';
import Game from './components/Game';
import TurnSummary from './components/TurnSummary';
import EndGame from './components/EndGame';
import { wordCards } from './data/words';
import './App.css';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const PHASES = {
  SETUP: 'setup',
  PRE_TURN: 'preTurn',
  PLAYING: 'playing',
  TURN_SUMMARY: 'turnSummary',
  END_GAME: 'endGame',
};

export default function App() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [settings, setSettings] = useState(null);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [wordQueue, setWordQueue] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [lastTurnResults, setLastTurnResults] = useState([]);

  const handleStart = useCallback(({ teams: teamNames, timerDuration, numRounds, skipPenalty }) => {
    setTeams(teamNames);
    setScores(new Array(teamNames.length).fill(0));
    setSettings({ timerDuration, numRounds, skipPenalty });
    setCurrentTeamIndex(0);
    setCurrentRound(1);
    setWordQueue(shuffle(wordCards));
    setCardIndex(0);
    setPhase(PHASES.PRE_TURN);
  }, []);

  const handleBeginTurn = useCallback(() => {
    setPhase(PHASES.PLAYING);
  }, []);

  const handleTurnEnd = useCallback((results, nextCardIndex) => {
    const correct = results.filter((r) => r.result === 'correct').length;
    const taboos = results.filter((r) => r.result === 'taboo').length;
    const skips = results.filter((r) => r.result === 'skip').length;
    const turnScore =
      correct - taboos - (settings.skipPenalty ? skips : 0);

    setScores((prev) => {
      const updated = [...prev];
      updated[currentTeamIndex] = Math.max(0, updated[currentTeamIndex] + turnScore);
      return updated;
    });

    setLastTurnResults(results);
    setCardIndex(nextCardIndex % wordCards.length);

    // Reshuffle if we've cycled through
    if (nextCardIndex >= wordQueue.length) {
      setWordQueue(shuffle(wordCards));
      setCardIndex(0);
    }

    setPhase(PHASES.TURN_SUMMARY);
  }, [currentTeamIndex, settings, wordQueue.length]);

  const isLastTurn = () => {
    const isLastTeam = currentTeamIndex === teams.length - 1;
    const isLastRound = currentRound === settings.numRounds;
    return isLastTeam && isLastRound;
  };

  const handleNextTurn = useCallback(() => {
    if (isLastTurn()) {
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
    setScores(new Array(teams.length).fill(0));
    setCurrentTeamIndex(0);
    setCurrentRound(1);
    setWordQueue(shuffle(wordCards));
    setCardIndex(0);
    setPhase(PHASES.PRE_TURN);
  }, [teams.length]);

  const handleNewGame = useCallback(() => {
    setPhase(PHASES.SETUP);
  }, []);

  return (
    <div className="app">
      {phase === PHASES.SETUP && (
        <Setup onStart={handleStart} />
      )}
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
