import React, { useState } from 'react';
import { ChevronRight, Trash2, RotateCcw, Plus, Download } from 'lucide-react';

export default function DartsScorer() {
  const [screen, setScreen] = useState('setup');
  const [ourTeam, setOurTeam] = useState('');
  const [theirTeam, setTheirTeam] = useState('');
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(null);
  const [currentScore, setCurrentScore] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [gameShot, setGameShot] = useState(false);

  const gameFormats = [
    { id: 1, name: '1st 6v6', type: '6v6', playerCount: 6 },
    { id: 2, name: '1st 3v3', type: '3v3', playerCount: 3 },
    { id: 3, name: '2nd 3v3', type: '3v3', playerCount: 3 },
    { id: 4, name: '1st 2v2', type: '2v2', playerCount: 2 },
    { id: 5, name: '2nd 2v2', type: '2v2', playerCount: 2 },
    { id: 6, name: '3rd 2v2', type: '2v2', playerCount: 2 },
    { id: 7, name: 'Singles', type: 'singles', playerCount: 1 },
    { id: 8, name: 'Final 6v6', type: '6v6', playerCount: 6 },
  ];

  const addPlayer = () => {
    if (newPlayer.trim() && players.length < 6) {
      setPlayers([...players, newPlayer.trim()]);
      setNewPlayer('');
    }
  };

  const removePlayer = (idx) => {
    setPlayers(players.filter((_, i) => i !== idx));
  };

  const startMatches = () => {
    if (ourTeam && theirTeam && players.length === 6) {
      const newMatches = gameFormats.map((format, idx) => {
        if (format.type === 'singles') {
          return {
            ...format,
            player: null,
            scores: [],
            result: null,
            gameShot: false,
          };
        } else {
          const startIdx = idx === 0 ? 0 : idx === 1 ? 0 : idx === 2 ? 3 : idx === 3 ? 0 : idx === 4 ? 2 : idx === 5 ? 4 : 0;
          const playerList = players.slice(startIdx, startIdx + format.playerCount);
          return {
            ...format,
            players: playerList,
            scores: [],
            result: null,
            gameShot: false,
          };
        }
      });
      setMatches(newMatches);
      setCurrentMatchIdx(0);
      setScreen('scoring');
    }
  };

  const getAvailableSinglesPlayers = () => {
    const usedPlayers = matches
      .slice(0, currentMatchIdx)
      .filter(m => m.type === 'singles' && m.player)
      .map(m => m.player);
    return players.filter(p => !usedPlayers.includes(p));
  };

  const addScore = () => {
    if (currentScore.trim()) {
      const score = parseInt(currentScore);
      if (!isNaN(score)) {
        const updated = [...matches];
        updated[currentMatchIdx].scores.push(score);
        setMatches(updated);
        setCurrentScore('');
      }
    }
  };

  const removeLastScore = () => {
    const updated = [...matches];
    updated[currentMatchIdx].scores.pop();
    setMatches(updated);
  };

  const finishGame = () => {
    if (selectedResult) {
      const updated = [...matches];
      updated[currentMatchIdx].result = selectedResult;
      updated[currentMatchIdx].gameShot = gameShot && selectedResult === 'win';
      setMatches(updated);
      
      if (currentMatchIdx < matches.length - 1) {
        setCurrentMatchIdx(currentMatchIdx + 1);
        setCurrentScore('');
        setSelectedResult(null);
        setSelectedPlayer('');
        setGameShot(false);
      } else {
        setScreen('summary');
      }
    }
  };

  const calculatePlayerStats = () => {
    const stats = {};

    matches.forEach(match => {
      const playerList = match.type === 'singles' ? [match.player] : match.players;
      
      playerList.forEach((player, idx) => {
        if (!stats[player]) {
          stats[player] = {
            totalPoints: 0,
            dartCount: 0,
            gameShots: 0,
            wins: 0,
            losses: 0,
            games: 0,
          };
        }

        stats[player].games++;
        stats[player].totalPoints += match.scores.reduce((a, b) => a + b, 0);
        stats[player].dartCount += match.scores.length;

        if (match.result === 'win') {
          stats[player].wins++;
          if (match.gameShot) {
            stats[player].gameShots++;
          }
        } else if (match.result === 'loss') {
          stats[player].losses++;
        }
      });
    });

    // Calculate averages
    Object.keys(stats).forEach(player => {
      const s = stats[player];
      const totalForAverage = s.totalPoints + (s.gameShots * 60);
      const averageDarts = s.dartCount + (s.gameShots * 3);
      s.average = averageDarts > 0 ? (totalForAverage / averageDarts * 3).toFixed(2) : '0.00';
    });

    return stats;
  };

  const calculateStats = () => {
    let wins = 0;
    let losses = 0;

    matches.forEach(match => {
      if (match.result === 'win') wins++;
      else if (match.result === 'loss') losses++;
    });

    return { wins, losses, total: wins + losses };
  };

  const exportData = () => {
    const playerStats = calculatePlayerStats();
    const matchStats = calculateStats();

    let csv = 'DARTS MATCH SUMMARY\n';
    csv += `Team: ${ourTeam} vs ${theirTeam}\n\n`;
    csv += `TEAM RESULTS\n`;
    csv += `Wins,${matchStats.wins}\n`;
    csv += `Losses,${matchStats.losses}\n`;
    csv += `Total Games,${matchStats.total}\n`;
    csv += `Win Rate,${matchStats.total > 0 ? Math.round((matchStats.wins / matchStats.total) * 100) : 0}%\n\n`;

    csv += 'PLAYER AVERAGES\n';
    csv += 'Player,Games,Wins,Losses,Total Points,Darts Thrown,Game Shots,Average\n';

    Object.keys(playerStats).sort().forEach(player => {
      const s = playerStats[player];
      csv += `${player},${s.games},${s.wins},${s.losses},${s.totalPoints},${s.dartCount},${s.gameShots},${s.average}\n`;
    });

    csv += '\nGAME BY GAME BREAKDOWN\n';
    csv += 'Game,Players,Score,Result,Game Shot\n';

    matches.forEach(match => {
      const playerList = match.type === 'singles' ? match.player : match.players.join(' & ');
      const totalScore = match.scores.reduce((a, b) => a + b, 0);
      csv += `${match.name},${playerList},${totalScore},${match.result || 'N/A'},${match.gameShot ? 'Yes' : 'No'}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `darts-match-${new Date().toISOString().slice(0, 10)}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (screen === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Darts Scorer</h1>

          <div className="bg-slate-700 rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Your Team Name</label>
              <input
                type="text"
                value={ourTeam}
                onChange={(e) => setOurTeam(e.target.value)}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-400 focus:outline-none"
                placeholder="e.g. Albert A"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Their Team Name</label>
              <input
                type="text"
                value={theirTeam}
                onChange={(e) => setTheirTeam(e.target.value)}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-400 focus:outline-none"
                placeholder="e.g. Albert B"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Your Players (6 needed)</label>
              <div className="space-y-2 mb-3">
                {players.map((player, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-600 p-2 rounded">
                    <span className="text-white">{idx + 1}. {player}</span>
                    <button
                      onClick={() => removePlayer(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {players.length < 6 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlayer}
                    onChange={(e) => setNewPlayer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    className="flex-1 px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 text-sm focus:border-blue-400 focus:outline-none"
                    placeholder="Player name"
                  />
                  <button
                    onClick={addPlayer}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center gap-1"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={startMatches}
              disabled={!ourTeam || !theirTeam || players.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 mt-8"
            >
              Start Match <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'scoring' && matches.length > 0) {
    const currentMatch = matches[currentMatchIdx];
    const isSingles = currentMatch.type === 'singles';
    const gameComplete = currentMatch.result !== null;
    const totalScore = currentMatch.scores.reduce((a, b) => a + b, 0);
    const availablePlayers = isSingles ? getAvailableSinglesPlayers() : [];
    const playerDisplay = isSingles ? selectedPlayer : currentMatch.players.join(', ');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-white">{currentMatch.name}</h1>
              <span className="text-slate-400 text-sm">
                {currentMatchIdx + 1} of {matches.length}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentMatchIdx + 1) / matches.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 mb-6">
            {isSingles && !selectedPlayer ? (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Select Player</h2>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-400 focus:outline-none mb-4"
                >
                  <option value="">Choose a player...</option>
                  {availablePlayers.map(player => (
                    <option key={player} value={player}>{player}</option>
                  ))}
                </select>
                {availablePlayers.length === 0 && (
                  <p className="text-red-400 text-sm">No players available</p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">{playerDisplay}</h2>

                <div className="bg-slate-600 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {totalScore}
                  </div>
                  <div className="text-slate-300 text-sm flex flex-wrap gap-2">
                    {currentMatch.scores.map((score, i) => (
                      <span key={i} className="bg-slate-500 px-2 py-1 rounded">
                        {score}
                      </span>
                    ))}
                    {currentMatch.scores.length === 0 && (
                      <span className="text-slate-400">No scores yet</span>
                    )}
                  </div>
                </div>

                {!gameComplete && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={currentScore}
                      onChange={(e) => setCurrentScore(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addScore()}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-400 focus:outline-none text-center text-lg"
                      placeholder="Score"
                      autoFocus
                    />
                    <button
                      onClick={addScore}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                    >
                      Add
                    </button>
                    <button
                      onClick={removeLastScore}
                      disabled={currentMatch.scores.length === 0}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white px-3 py-2 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!selectedPlayer && isSingles ? (
            <div></div>
          ) : !gameComplete ? (
            <div>
              <p className="text-slate-300 text-sm text-center mb-4">Did you win?</p>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setSelectedResult('win')}
                  className={`flex-1 py-3 rounded font-bold ${
                    selectedResult === 'win'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-600 text-white hover:bg-slate-500'
                  }`}
                >
                  Win
                </button>
                <button
                  onClick={() => setSelectedResult('loss')}
                  className={`flex-1 py-3 rounded font-bold ${
                    selectedResult === 'loss'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-600 text-white hover:bg-slate-500'
                  }`}
                >
                  Loss
                </button>
              </div>

              {selectedResult === 'win' && (
                <div className="mb-4 bg-slate-600 rounded p-3">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gameShot}
                      onChange={(e) => setGameShot(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Game shot (add 60 to average)</span>
                  </label>
                </div>
              )}

              <button
                onClick={finishGame}
                disabled={!selectedResult}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-bold py-3 rounded"
              >
                Finish Game
              </button>
            </div>
          ) : (
            <div>
              <div className={`rounded-lg p-4 text-center mb-4 ${
                currentMatch.result === 'win' 
                  ? 'bg-green-900 border border-green-600' 
                  : 'bg-red-900 border border-red-600'
              }`}>
                <p className={`font-semibold ${
                  currentMatch.result === 'win' 
                    ? 'text-green-200' 
                    : 'text-red-200'
                }`}>
                  {currentMatch.result === 'win' ? 'You won' : 'You lost'}
                  {currentMatch.gameShot && currentMatch.result === 'win' && (
                    <span className="text-sm block mt-1">Game shot marked</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  if (currentMatchIdx < matches.length - 1) {
                    setCurrentMatchIdx(currentMatchIdx + 1);
                    setCurrentScore('');
                    setSelectedResult(null);
                    setSelectedPlayer('');
                    setGameShot(false);
                  } else {
                    setScreen('summary');
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
              >
                {currentMatchIdx === matches.length - 1 ? 'Finish Match' : 'Next Game'} <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'summary') {
    const { wins, losses, total } = calculateStats();
    const playerStats = calculatePlayerStats();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Match Summary</h1>

          <div className="bg-slate-700 rounded-lg p-8 mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">{ourTeam}</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-4xl font-bold text-green-400">{wins}</div>
                <div className="text-slate-300 text-sm mt-2">Wins</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-slate-300">{total}</div>
                <div className="text-slate-300 text-sm mt-2">Games</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-400">{losses}</div>
                <div className="text-slate-300 text-sm mt-2">Losses</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {total > 0 ? Math.round((wins / total) * 100) : 0}% Win Rate
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Player Averages</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left p-2">Player</th>
                    <th className="text-center p-2">Games</th>
                    <th className="text-center p-2">Wins</th>
                    <th className="text-center p-2">Losses</th>
                    <th className="text-center p-2">Shots</th>
                    <th className="text-center p-2">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(playerStats).sort().map(player => (
                    <tr key={player} className="border-b border-slate-600">
                      <td className="p-2 font-semibold text-white">{player}</td>
                      <td className="text-center p-2">{playerStats[player].games}</td>
                      <td className="text-center p-2 text-green-400">{playerStats[player].wins}</td>
                      <td className="text-center p-2 text-red-400">{playerStats[player].losses}</td>
                      <td className="text-center p-2">{playerStats[player].gameShots}</td>
                      <td className="text-center p-2 font-bold text-blue-400">{playerStats[player].average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Results by Game</h3>
            <div className="space-y-2">
              {matches.map((match, idx) => (
                <div key={idx} className="bg-slate-600 rounded p-3 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white">{match.name}</span>
                    <div className="text-slate-400 text-sm">
                      {match.type === 'singles' ? match.player : match.players.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-300 text-sm">
                      Score: {match.scores.reduce((a, b) => a + b, 0)}
                    </div>
                    <div className={`text-sm font-bold ${
                      match.result === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {match.result ? match.result.charAt(0).toUpperCase() + match.result.slice(1) : 'Not recorded'}
                      {match.gameShot && ' (Shot)'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setScreen('setup');
                setOurTeam('');
                setTheirTeam('');
                setPlayers([]);
                setNewPlayer('');
                setMatches([]);
                setCurrentMatchIdx(null);
                setCurrentScore('');
                setSelectedResult(null);
                setSelectedPlayer('');
                setGameShot(false);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Start New Match
            </button>
            <button
              onClick={exportData}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
            >
              <Download size={20} /> Export CSV
            </button>
          </div>
        </div>
      </div>
    );
  }
}
