import React, { useState } from 'react';

const C = {
  bg: '#14170F',
  panel: '#1C2216',
  panelLight: '#242B1C',
  line: '#323B28',
  cream: '#EFE7D2',
  muted: '#9AA189',
  green: '#2E7D4F',
  greenDeep: '#1F5C39',
  red: '#B33A31',
  brass: '#C9A227',
  brassDim: '#8A7220',
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap');
.ds-root { font-family: 'Barlow', sans-serif; }
.ds-display { font-family: 'Barlow Condensed', sans-serif; }
.ds-num { font-variant-numeric: tabular-nums; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
`;

const Btn = ({ onClick, disabled, color, children, big, outline }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`ds-display rounded ${big ? 'py-4 text-xl' : 'py-3 text-lg'} px-4 font-semibold tracking-wide uppercase transition-colors w-full`}
    style={{
      background: disabled ? C.panelLight : outline ? 'transparent' : color,
      color: disabled ? C.muted : outline ? color : C.cream,
      border: outline ? `1px solid ${color}` : '1px solid transparent',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
  >
    {children}
  </button>
);

const Chip = ({ children, dim }) => (
  <span className="ds-num px-2 py-0.5 rounded text-sm" style={{ background: dim ? C.panelLight : C.line, color: C.cream }}>
    {children}
  </span>
);

const Wrap = ({ children }) => (
  <div className="ds-root min-h-screen px-4 py-6" style={{ background: C.bg, color: C.cream }}>
    <style>{styles}</style>
    <div className="max-w-md mx-auto">{children}</div>
  </div>
);

function buildGames(bestOf) {
  const g = [
    { kind: 'team', name: '1st 6v6', start: 801, playerIdxs: [0, 1, 2, 3, 4, 5], visits: [], result: null, gameShotPlayer: null },
    { kind: 'team', name: '1st 3v3', start: 701, playerIdxs: [0, 1, 2], visits: [], result: null, gameShotPlayer: null },
    { kind: 'team', name: '2nd 3v3', start: 701, playerIdxs: [3, 4, 5], visits: [], result: null, gameShotPlayer: null },
    { kind: 'team', name: '1st 2v2', start: 601, playerIdxs: [0, 1], visits: [], result: null, gameShotPlayer: null },
    { kind: 'team', name: '2nd 2v2', start: 601, playerIdxs: [2, 3], visits: [], result: null, gameShotPlayer: null },
    { kind: 'team', name: '3rd 2v2', start: 601, playerIdxs: [4, 5], visits: [], result: null, gameShotPlayer: null },
  ];
  for (let i = 1; i <= 6; i++) {
    g.push({ kind: 'singles', name: `Singles ${i}`, start: 501, player: null, legs: [{ visits: [], result: null }], result: null });
  }
  g.push({ kind: 'team', name: 'Final 6v6', start: 801, playerIdxs: [0, 1, 2, 3, 4, 5], visits: [], result: null, gameShotPlayer: null });
  return g;
}

export default function App() {
  const [screen, setScreen] = useState('setup');
  const [ourTeam, setOurTeam] = useState('');
  const [theirTeam, setTheirTeam] = useState('');
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [games, setGames] = useState([]);
  const [gameIdx, setGameIdx] = useState(0);
  const [scoreInput, setScoreInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [singlesBestOf, setSinglesBestOf] = useState(null);
  const [pendingWin, setPendingWin] = useState(false);
  const [endEarly, setEndEarly] = useState(false);

  const addPlayer = () => {
    const n = newPlayer.trim();
    if (n && players.length < 6 && !players.includes(n)) {
      setPlayers([...players, n]);
      setNewPlayer('');
    }
  };

  const startMatch = () => {
    if (ourTeam && theirTeam && players.length === 6) {
      setGames(buildGames());
      setGameIdx(0);
      setScreen('scoring');
    }
  };

  const resetAll = () => {
    setScreen('setup'); setOurTeam(''); setTheirTeam(''); setPlayers([]); setNewPlayer('');
    setGames([]); setGameIdx(0); setScoreInput(''); setInputError('');
    setSinglesBestOf(null); setPendingWin(false); setEndEarly(false);
  };

  const game = games[gameIdx];

  const sumVisits = (visits) => visits.reduce((a, v) => a + v.s, 0);

  const currentLeg = (g) => g.legs[g.legs.length - 1];

  const remaining = () => {
    if (!game) return 0;
    if (game.kind === 'team') return game.start - sumVisits(game.visits);
    return game.start - sumVisits(currentLeg(game).visits);
  };

  const throwerIdx = () => game.playerIdxs[game.visits.length % game.playerIdxs.length];

  const submitScore = () => {
    const raw = scoreInput.trim();
    if (raw === '') return;
    const s = parseInt(raw, 10);
    const rem = remaining();
    if (isNaN(s) || s < 0 || s > 180) {
      setInputError('Enter a score between 0 and 180');
      return;
    }
    if (s >= rem) {
      setInputError(`That would finish or bust it. A bust scores 0. Highest you can log is ${rem - 1}.`);
      return;
    }
    const updated = [...games];
    const g = { ...updated[gameIdx] };
    if (g.kind === 'team') {
      g.visits = [...g.visits, { p: throwerIdx(), s }];
    } else {
      const legs = g.legs.map(l => ({ ...l, visits: [...l.visits] }));
      legs[legs.length - 1].visits.push({ s });
      g.legs = legs;
    }
    updated[gameIdx] = g;
    setGames(updated);
    setScoreInput('');
    setInputError('');
  };

  const undoScore = () => {
    const updated = [...games];
    const g = { ...updated[gameIdx] };
    if (g.kind === 'team') {
      if (g.visits.length === 0) return;
      g.visits = g.visits.slice(0, -1);
    } else {
      const legs = g.legs.map(l => ({ ...l, visits: [...l.visits] }));
      const leg = legs[legs.length - 1];
      if (leg.visits.length === 0) return;
      leg.visits.pop();
      g.legs = legs;
    }
    updated[gameIdx] = g;
    setGames(updated);
    setInputError('');
  };

  const finishTeam = (result, gsPlayer) => {
    const updated = [...games];
    updated[gameIdx] = { ...updated[gameIdx], result, gameShotPlayer: gsPlayer ?? null };
    setGames(updated);
    setPendingWin(false);
    setEndEarly(false);
  };

  const finishLeg = (legResult) => {
    const updated = [...games];
    const g = { ...updated[gameIdx] };
    const legs = g.legs.map(l => ({ ...l }));
    legs[legs.length - 1].result = legResult;
    const target = singlesBestOf === 3 ? 2 : 1;
    const wins = legs.filter(l => l.result === 'win').length;
    const losses = legs.filter(l => l.result === 'loss').length;
    if (wins >= target) {
      g.result = 'win';
    } else if (losses >= target) {
      g.result = 'loss';
    } else {
      legs.push({ visits: [], result: null });
    }
    g.legs = legs;
    updated[gameIdx] = g;
    setGames(updated);
    setEndEarly(false);
  };

  const nextGame = () => {
    setScoreInput(''); setInputError(''); setPendingWin(false); setEndEarly(false);
    if (gameIdx < games.length - 1) {
      setGameIdx(gameIdx + 1);
    } else {
      setScreen('summary');
    }
  };

  const pickSinglesPlayer = (pIdx) => {
    const updated = [...games];
    updated[gameIdx] = { ...updated[gameIdx], player: pIdx };
    setGames(updated);
  };

  const availableSingles = () => {
    const used = games.filter(g => g.kind === 'singles' && g.player !== null).map(g => g.player);
    return players.map((_, i) => i).filter(i => !used.includes(i));
  };

  const playerStats = () => {
    const st = players.map(() => ({
      points: 0, visits: 0, checkouts: 0, gameShots: 0, tons: 0, highest: 0,
      wins: 0, losses: 0, games: 0,
    }));
    const logVisit = (p, s) => {
      st[p].points += s;
      st[p].visits++;
      if (s >= 100) st[p].tons++;
      if (s > st[p].highest) st[p].highest = s;
    };
    games.forEach(g => {
      if (g.kind === 'team') {
        g.playerIdxs.forEach(p => {
          st[p].games++;
          if (g.result === 'win') st[p].wins++;
          if (g.result === 'loss') st[p].losses++;
        });
        g.visits.forEach(v => logVisit(v.p, v.s));
        if (g.result === 'win' && g.gameShotPlayer !== null) {
          st[g.gameShotPlayer].checkouts++;
          st[g.gameShotPlayer].gameShots++;
        }
      } else if (g.player !== null) {
        const p = g.player;
        st[p].games++;
        if (g.result === 'win') st[p].wins++;
        if (g.result === 'loss') st[p].losses++;
        g.legs.forEach(l => {
          l.visits.forEach(v => logVisit(p, v.s));
          if (l.result === 'win') st[p].checkouts++;
        });
        if (g.result === 'win') st[p].gameShots++;
      }
    });
    return st;
  };

  const teamRecord = () => {
    let w = 0, l = 0;
    games.forEach(g => { if (g.result === 'win') w++; if (g.result === 'loss') l++; });
    return { w, l, t: w + l };
  };

  const avgFor = (s) => {
    if (s.visits === 0) return null;
    return ((s.points + 60 * s.checkouts) / s.visits).toFixed(2);
  };

  // Players ordered by average, best first. Anyone who never threw drops to the bottom.
  const rankedPlayers = () => {
    const st = playerStats();
    return players
      .map((name, i) => ({ name, i, s: st[i], avg: avgFor(st[i]) }))
      .sort((a, b) => {
        const av = a.avg === null ? -1 : parseFloat(a.avg);
        const bv = b.avg === null ? -1 : parseFloat(b.avg);
        if (bv !== av) return bv - av;
        if (b.s.checkouts !== a.s.checkouts) return b.s.checkouts - a.s.checkouts;
        return a.i - b.i;
      });
  };

  const exportCSV = () => {
    const ranked = rankedPlayers();
    const rec = teamRecord();
    let csv = 'DARTS MATCH SUMMARY\n';
    csv += `${ourTeam} v ${theirTeam}\n`;
    csv += `Date,${new Date().toLocaleDateString('en-GB')}\n\n`;
    csv += 'TEAM RESULT\n';
    csv += `Wins,${rec.w}\nLosses,${rec.l}\nGames,${rec.t}\n\n`;
    csv += 'PLAYER AVERAGES\n';
    csv += 'Rank,Player,Games,Wins,Losses,Visits,Darts,Points,Highest Score,100+ Scores,Checkouts,Game Shots,Average\n';
    ranked.forEach((r, pos) => {
      const s = r.s;
      csv += `${pos + 1},${r.name},${s.games},${s.wins},${s.losses},${s.visits},${s.visits * 3},${s.points},${s.highest},${s.tons},${s.checkouts},${s.gameShots},${r.avg ?? ''}\n`;
    });
    csv += '\nGAME BY GAME\n';
    csv += 'Game,Player,Scores,Result,Game Shot\n';
    games.forEach(g => {
      if (g.kind === 'team') {
        g.playerIdxs.forEach(p => {
          const scores = g.visits.filter(v => v.p === p).map(v => v.s).join(' ');
          const gs = g.gameShotPlayer === p ? 'Yes' : '';
          csv += `${g.name},${players[p]},${scores},${g.result ?? ''},${gs}\n`;
        });
      } else if (g.player !== null) {
        g.legs.forEach((l, li) => {
          const scores = l.visits.map(v => v.s).join(' ');
          csv += `${g.name} leg ${li + 1},${players[g.player]},${scores},${l.result ?? ''},${l.result === 'win' ? 'Yes' : ''}\n`;
        });
      }
    });
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    el.setAttribute('download', `darts-${new Date().toISOString().slice(0, 10)}.csv`);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  // ---------- setup ----------

  if (screen === 'setup') {
    return (
      <Wrap>
        <div className="text-center mb-8 mt-4">
          <div className="ds-display text-5xl font-bold tracking-wide" style={{ color: C.cream }}>MATCH NIGHT</div>
          <div className="ds-display text-lg tracking-[0.3em] uppercase mt-1" style={{ color: C.brass }}>Team Darts Scorer</div>
        </div>

        <div className="rounded-lg p-5 space-y-5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div>
            <label className="ds-display text-sm uppercase tracking-widest" style={{ color: C.muted }}>Home side</label>
            <input
              type="text" value={ourTeam} onChange={e => setOurTeam(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded outline-none"
              style={{ background: C.bg, color: C.cream, border: `1px solid ${C.line}` }}
              placeholder="Your team, e.g. Albert A"
            />
          </div>
          <div>
            <label className="ds-display text-sm uppercase tracking-widest" style={{ color: C.muted }}>Opposition</label>
            <input
              type="text" value={theirTeam} onChange={e => setTheirTeam(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded outline-none"
              style={{ background: C.bg, color: C.cream, border: `1px solid ${C.line}` }}
              placeholder="Their team"
            />
          </div>

          <div>
            <label className="ds-display text-sm uppercase tracking-widest" style={{ color: C.muted }}>
              Playing order ({players.length}/6)
            </label>
            <div className="space-y-1.5 mt-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                  <span><span className="ds-display mr-2" style={{ color: C.brass }}>{i + 1}</span>{p}</span>
                  <button onClick={() => setPlayers(players.filter((_, j) => j !== i))} style={{ color: C.red }} className="text-sm">remove</button>
                </div>
              ))}
            </div>
            {players.length < 6 && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text" value={newPlayer} onChange={e => setNewPlayer(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addPlayer()}
                  className="flex-1 px-3 py-2.5 rounded outline-none"
                  style={{ background: C.bg, color: C.cream, border: `1px solid ${C.line}` }}
                  placeholder={`Player ${players.length + 1}`}
                />
                <button onClick={addPlayer} className="ds-display px-4 rounded uppercase font-semibold" style={{ background: C.line, color: C.cream }}>Add</button>
              </div>
            )}
          </div>

          <Btn onClick={startMatch} disabled={!ourTeam || !theirTeam || players.length !== 6} color={C.green} big>
            Game on
          </Btn>
        </div>
      </Wrap>
    );
  }

  // ---------- scoring ----------

  if (screen === 'scoring' && game) {
    const rem = remaining();
    const onFinish = rem < 100;
    const isTeam = game.kind === 'team';
    const singlesNeedsBestOf = !isTeam && singlesBestOf === null;
    const singlesNeedsPlayer = !isTeam && !singlesNeedsBestOf && game.player === null;

    const header = (
      <div className="mb-5">
        <div className="flex items-baseline justify-between">
          <div className="ds-display text-3xl font-bold uppercase tracking-wide">{game.name}</div>
          <div className="ds-display text-sm uppercase tracking-widest" style={{ color: C.muted }}>{gameIdx + 1} / {games.length}</div>
        </div>
        <div className="ds-display text-sm uppercase tracking-widest mt-0.5" style={{ color: C.muted }}>
          {ourTeam} <span style={{ color: C.brass }}>v</span> {theirTeam}
          {!isTeam && singlesBestOf && <span> &middot; best of {singlesBestOf}</span>}
        </div>
        <div className="h-1 rounded-full mt-3" style={{ background: C.line }}>
          <div className="h-1 rounded-full transition-all" style={{ width: `${((gameIdx + 1) / games.length) * 100}%`, background: C.brass }}></div>
        </div>
      </div>
    );

    if (singlesNeedsBestOf) {
      return (
        <Wrap>
          {header}
          <div className="rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="ds-display text-xl uppercase tracking-wide mb-1">Singles format</div>
            <p className="text-sm mb-4" style={{ color: C.muted }}>How many legs are the singles tonight?</p>
            <div className="flex gap-3">
              <Btn onClick={() => setSinglesBestOf(1)} color={C.green} big>Best of 1</Btn>
              <Btn onClick={() => setSinglesBestOf(3)} color={C.green} big>Best of 3</Btn>
            </div>
          </div>
        </Wrap>
      );
    }

    if (singlesNeedsPlayer) {
      return (
        <Wrap>
          {header}
          <div className="rounded-lg p-5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="ds-display text-xl uppercase tracking-wide mb-1">Who's up?</div>
            <p className="text-sm mb-4" style={{ color: C.muted }}>Players drop off the list once they've played.</p>
            <div className="grid grid-cols-2 gap-2">
              {availableSingles().map(i => (
                <Btn key={i} onClick={() => pickSinglesPlayer(i)} color={C.brassDim}>{players[i]}</Btn>
              ))}
            </div>
          </div>
        </Wrap>
      );
    }

    const legNo = isTeam ? null : game.legs.length;
    const showInput = !game.result && !onFinish && !endEarly && !pendingWin;

    return (
      <Wrap>
        {header}

        {/* countdown */}
        <div
          className="rounded-lg p-5 text-center mb-4 transition-colors"
          style={{
            background: onFinish && !game.result ? C.brassDim : C.panel,
            border: `1px solid ${onFinish && !game.result ? C.brass : C.line}`,
          }}
        >
          {!isTeam && (
            <div className="flex justify-center gap-2 mb-2">
              {Array.from({ length: singlesBestOf }).map((_, i) => {
                const l = game.legs[i];
                const bgc = l?.result === 'win' ? C.green : l?.result === 'loss' ? C.red : i === game.legs.length - 1 && !game.result ? C.brass : C.line;
                return <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: bgc }}></div>;
              })}
            </div>
          )}
          <div className="ds-display ds-num font-bold leading-none" style={{ fontSize: '5.5rem', color: C.cream }}>
            {rem}
          </div>
          <div className="ds-display uppercase tracking-[0.25em] text-sm mt-1" style={{ color: onFinish && !game.result ? C.cream : C.muted }}>
            {game.result ? 'Game over' : onFinish ? 'On a finish. Down tools, no more scoring.' : isTeam ? `from ${game.start}` : `Leg ${legNo} &middot; from ${game.start}`.replace('&middot;', '·')}
          </div>
        </div>

        {/* player rota / score list */}
        <div className="rounded-lg mb-4 overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          {isTeam ? game.playerIdxs.map(p => {
            const isThrower = !game.result && !onFinish && p === throwerIdx();
            const scores = game.visits.filter(v => v.p === p);
            return (
              <div key={p} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${C.line}`, borderLeft: `3px solid ${isThrower ? C.brass : 'transparent'}`, background: isThrower ? C.panelLight : 'transparent' }}>
                <div className="ds-display uppercase tracking-wide w-20 shrink-0 pt-0.5" style={{ color: isThrower ? C.brass : C.cream }}>
                  {players[p]}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scores.map((v, i) => <Chip key={i}>{v.s}</Chip>)}
                  {isThrower && <span className="text-sm pt-0.5" style={{ color: C.brass }}>to throw</span>}
                </div>
                {game.gameShotPlayer === p && <span className="ds-display ml-auto uppercase text-sm pt-1" style={{ color: C.brass }}>GS +60</span>}
              </div>
            );
          }) : (
            <div className="px-4 py-3">
              <div className="ds-display uppercase tracking-wide mb-2" style={{ color: C.brass }}>{players[game.player]}</div>
              {game.legs.map((l, li) => (
                <div key={li} className="flex items-start gap-3 py-1.5" style={{ borderTop: li > 0 ? `1px solid ${C.line}` : 'none' }}>
                  <div className="ds-display uppercase text-sm w-12 shrink-0 pt-0.5" style={{ color: C.muted }}>Leg {li + 1}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {l.visits.map((v, i) => <Chip key={i} dim={li < game.legs.length - 1}>{v.s}</Chip>)}
                  </div>
                  {l.result && (
                    <span className="ds-display ml-auto uppercase text-sm pt-0.5" style={{ color: l.result === 'win' ? C.green : C.red }}>
                      {l.result === 'win' ? 'Won · +60' : 'Lost'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* score entry */}
        {showInput && (
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="number" inputMode="numeric" value={scoreInput}
                onChange={e => setScoreInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && submitScore()}
                className="ds-display ds-num flex-1 px-3 py-3 rounded outline-none text-center text-2xl"
                style={{ background: C.panel, color: C.cream, border: `1px solid ${C.line}` }}
                placeholder={isTeam ? `${players[throwerIdx()]} scores...` : 'Score...'}
                autoFocus
              />
              <button onClick={submitScore} className="ds-display px-6 rounded uppercase font-semibold text-lg" style={{ background: C.green, color: C.cream }}>Enter</button>
              <button onClick={undoScore} className="ds-display px-4 rounded uppercase font-semibold" style={{ background: C.panel, color: C.red, border: `1px solid ${C.line}` }}>Undo</button>
            </div>
            {inputError && <p className="text-sm mt-2" style={{ color: C.red }}>{inputError}</p>}
            <button onClick={() => setEndEarly(true)} className="text-sm mt-3 underline" style={{ color: C.muted }}>
              Game's finished already? Record the result
            </button>
          </div>
        )}

        {/* result flow */}
        {!game.result && (onFinish || endEarly) && !pendingWin && (
          <div className="rounded-lg p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="ds-display uppercase tracking-wide mb-3">{isTeam ? 'How did it end?' : `Leg ${legNo}: how did it end?`}</div>
            <div className="flex gap-3">
              <Btn onClick={() => { if (isTeam) { setPendingWin(true); } else { finishLeg('win'); } }} color={C.green} big>
                {isTeam ? 'We won' : 'Won the leg'}
              </Btn>
              <Btn onClick={() => { if (isTeam) { finishTeam('loss'); } else { finishLeg('loss'); } }} color={C.red} big>
                {isTeam ? 'We lost' : 'Lost the leg'}
              </Btn>
            </div>
            {!isTeam && <p className="text-sm mt-3" style={{ color: C.muted }}>A won leg is a checkout: {players[game.player]} gets 60 added, no darts counted.</p>}
            {endEarly && !onFinish && (
              <button onClick={() => setEndEarly(false)} className="text-sm mt-3 underline" style={{ color: C.muted }}>Back to scoring</button>
            )}
          </div>
        )}

        {pendingWin && (
          <div className="rounded-lg p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.brass}` }}>
            <div className="ds-display uppercase tracking-wide mb-1" style={{ color: C.brass }}>Who hit the game shot?</div>
            <p className="text-sm mb-3" style={{ color: C.muted }}>They get 60 added to their average, no darts counted.</p>
            <div className="grid grid-cols-2 gap-2">
              {game.playerIdxs.map(p => (
                <Btn key={p} onClick={() => finishTeam('win', p)} color={C.brassDim}>{players[p]}</Btn>
              ))}
            </div>
            <button onClick={() => setPendingWin(false)} className="text-sm mt-3 underline" style={{ color: C.muted }}>Back</button>
          </div>
        )}

        {game.result && (
          <div>
            <div className="rounded-lg p-4 text-center mb-4" style={{ background: game.result === 'win' ? C.greenDeep : C.red, border: `1px solid ${game.result === 'win' ? C.green : C.red}` }}>
              <div className="ds-display text-2xl uppercase tracking-wide font-semibold">
                {game.result === 'win' ? 'Game won' : 'Game lost'}
              </div>
              {isTeam && game.gameShotPlayer !== null && (
                <div className="text-sm mt-1" style={{ color: C.cream }}>Game shot: {players[game.gameShotPlayer]} (+60)</div>
              )}
              {!isTeam && (
                <div className="text-sm mt-1" style={{ color: C.cream }}>
                  {players[game.player]} &middot; legs {game.legs.filter(l => l.result === 'win').length}&ndash;{game.legs.filter(l => l.result === 'loss').length}
                </div>
              )}
            </div>
            <Btn onClick={nextGame} color={C.green} big>
              {gameIdx === games.length - 1 ? 'Finish the match' : 'Next game'}
            </Btn>
          </div>
        )}
      </Wrap>
    );
  }

  // ---------- summary ----------

  if (screen === 'summary') {
    const ranked = rankedPlayers();
    const rec = teamRecord();
    return (
      <Wrap>
        <div className="text-center mb-6 mt-2">
          <div className="ds-display text-4xl font-bold uppercase tracking-wide">Final reckoning</div>
          <div className="ds-display text-lg uppercase tracking-widest mt-1" style={{ color: C.muted }}>
            {ourTeam} <span style={{ color: C.brass }}>v</span> {theirTeam}
          </div>
        </div>

        <div className="rounded-lg p-5 mb-4 flex justify-around text-center" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div>
            <div className="ds-display ds-num text-5xl font-bold" style={{ color: C.green }}>{rec.w}</div>
            <div className="ds-display uppercase tracking-widest text-sm mt-1" style={{ color: C.muted }}>Won</div>
          </div>
          <div>
            <div className="ds-display ds-num text-5xl font-bold" style={{ color: C.red }}>{rec.l}</div>
            <div className="ds-display uppercase tracking-widest text-sm mt-1" style={{ color: C.muted }}>Lost</div>
          </div>
          <div>
            <div className="ds-display ds-num text-5xl font-bold" style={{ color: C.brass }}>{rec.t > 0 ? Math.round((rec.w / rec.t) * 100) : 0}%</div>
            <div className="ds-display uppercase tracking-widest text-sm mt-1" style={{ color: C.muted }}>Win rate</div>
          </div>
        </div>

        <div className="rounded-lg p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="ds-display uppercase tracking-wide mb-1" style={{ color: C.brass }}>Averages</div>
          <p className="text-xs mb-1" style={{ color: C.muted }}>Best to worst on the night.</p>
          {ranked.map((r, pos) => (
            <div key={r.i} className="py-3" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="flex items-baseline gap-2.5">
                <span className="ds-display ds-num text-lg font-bold w-5 shrink-0" style={{ color: pos === 0 ? C.brass : C.muted }}>
                  {pos + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="ds-display uppercase tracking-wide truncate">{r.name}</div>
                  <div className="ds-num text-xs mt-0.5" style={{ color: C.muted }}>
                    {r.s.games} played &middot; <span style={{ color: C.green }}>{r.s.wins}W</span> <span style={{ color: C.red }}>{r.s.losses}L</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="ds-display ds-num text-3xl font-bold leading-none">{r.avg ?? '\u2014'}</div>
                  <div className="ds-display uppercase tracking-widest text-xs mt-0.5" style={{ color: C.muted }}>Avg</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-2.5 pl-7">
                {[
                  ['Highest', r.s.highest || '\u2014'],
                  ['100+', r.s.tons],
                  ['Checkouts', r.s.checkouts],
                  ['Game shots', r.s.gameShots],
                ].map(([label, val]) => (
                  <div key={label} className="rounded px-1 py-1.5 text-center" style={{ background: C.panelLight }}>
                    <div className="ds-display ds-num text-xl font-semibold leading-none" style={{ color: val ? C.cream : C.muted }}>{val}</div>
                    <div className="ds-display uppercase tracking-wide mt-1" style={{ color: C.muted, fontSize: '0.6rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs mt-3" style={{ color: C.muted }}>
            Average is per visit (3 darts). Each checkout adds 60 with no darts counted. Checkouts are every winning double thrown; game shots are the ones that took the game.
          </p>
        </div>

        <div className="rounded-lg p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="ds-display uppercase tracking-wide mb-2" style={{ color: C.brass }}>Game by game</div>
          {games.map((g, i) => (
            <div key={i} className="py-2" style={{ borderTop: i > 0 ? `1px solid ${C.line}` : 'none' }}>
              <div className="flex justify-between items-baseline">
                <span className="ds-display uppercase">{g.name}{g.kind === 'singles' && g.player !== null ? ` \u00b7 ${players[g.player]}` : ''}</span>
                <span className="ds-display uppercase text-sm" style={{ color: g.result === 'win' ? C.green : g.result === 'loss' ? C.red : C.muted }}>
                  {g.result ?? 'not played'}
                </span>
              </div>
              {g.kind === 'team' && g.gameShotPlayer !== null && (
                <div className="text-xs mt-0.5" style={{ color: C.muted }}>Game shot: {players[g.gameShotPlayer]}</div>
              )}
              {g.kind === 'singles' && g.player !== null && (
                <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                  Legs {g.legs.filter(l => l.result === 'win').length}&ndash;{g.legs.filter(l => l.result === 'loss').length}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Btn onClick={exportCSV} color={C.brassDim}>Export CSV</Btn>
          <Btn onClick={resetAll} color={C.green}>New match</Btn>
        </div>
      </Wrap>
    );
  }

  return null;
}
