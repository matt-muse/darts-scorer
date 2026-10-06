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

const BOGEY = [159, 162, 163, 165, 166, 168, 169];

const categoriesFor = (teamSize) => teamSize === 8
  ? ['Singles', 'Pairs', 'Fours', 'Straight 8']
  : ['Singles', 'Pairs', 'Threes', '6v6'];

const categoryOf = (g) => {
  const n = g.kind === 'singles' ? 1 : g.playerIdxs.length;
  return { 1: 'Singles', 2: 'Pairs', 3: 'Threes', 4: 'Fours', 6: '6v6', 8: 'Straight 8' }[n];
};

const mean = (xs) => xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : null;

const fmt = (n) => n === null ? null : n.toFixed(2);

const Wrap = ({ children }) => (
  <div className="ds-root min-h-screen px-4 py-6" style={{ background: C.bg, color: C.cream }}>
    <style>{styles}</style>
    <div className="max-w-md mx-auto">{children}</div>
  </div>
);

function buildGames(teamSize, straightEightOpener) {
  if (teamSize === 8) {
    const g = [];
    if (straightEightOpener) {
      g.push({ kind: 'team', name: 'Straight Eight (Opener)', start: 1001, playerIdxs: [0, 1, 2, 3, 4, 5, 6, 7], visits: [], result: null, gameShotPlayer: null });
    }
    g.push({ kind: 'team', name: 'First Four', start: 801, playerIdxs: [0, 1, 2, 3], visits: [], result: null, gameShotPlayer: null });
    g.push({ kind: 'team', name: 'Second Four', start: 801, playerIdxs: [4, 5, 6, 7], visits: [], result: null, gameShotPlayer: null });
    g.push({ kind: 'team', name: 'First Pair', start: 601, playerIdxs: [0, 1], visits: [], result: null, gameShotPlayer: null });
    g.push({ kind: 'team', name: 'Second Pair', start: 601, playerIdxs: [2, 3], visits: [], result: null, gameShotPlayer: null });
    g.push({ kind: 'team', name: 'Third Pair', start: 601, playerIdxs: [4, 5], visits: [], result: null, gameShotPlayer: null });
    g.push({ kind: 'team', name: 'Fourth Pair', start: 601, playerIdxs: [6, 7], visits: [], result: null, gameShotPlayer: null });
    for (let i = 1; i <= 8; i++) {
      g.push({ kind: 'singles', name: `Singles ${i}`, start: 501, player: null, legs: [{ visits: [], result: null }], result: null });
    }
    g.push({ kind: 'team', name: 'Straight Eight', start: 1001, playerIdxs: [0, 1, 2, 3, 4, 5, 6, 7], visits: [], result: null, gameShotPlayer: null });
    return g;
  }
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
  const [teamSize, setTeamSize] = useState(6);
  const [straightEightOpener, setStraightEightOpener] = useState(false);
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [games, setGames] = useState([]);
  const [gameIdx, setGameIdx] = useState(0);
  const [scoreInput, setScoreInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [singlesBestOf, setSinglesBestOf] = useState(null);
  const [pendingWin, setPendingWin] = useState(false);
  const [endEarly, setEndEarly] = useState(false);
  const [checkoutFor, setCheckoutFor] = useState(null);

  const addPlayer = () => {
    const n = newPlayer.trim();
    if (n && players.length < teamSize && !players.includes(n)) {
      setPlayers([...players, n]);
      setNewPlayer('');
    }
  };

  const chooseTeamSize = (size) => {
    setTeamSize(size);
    if (players.length > size) setPlayers(players.slice(0, size));
    if (size !== 8) setStraightEightOpener(false);
  };

  const startMatch = () => {
    if (ourTeam && theirTeam && players.length === teamSize) {
      setGames(buildGames(teamSize, straightEightOpener));
      setGameIdx(0);
      if (teamSize === 8) setSinglesBestOf(1);
      setScreen('scoring');
    }
  };

  const resetAll = () => {
    setScreen('setup'); setOurTeam(''); setTheirTeam(''); setPlayers([]); setNewPlayer('');
    setGames([]); setGameIdx(0); setScoreInput(''); setInputError('');
    setSinglesBestOf(null); setPendingWin(false); setEndEarly(false); setCheckoutFor(null);
    setTeamSize(6); setStraightEightOpener(false);
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

  const appendDigit = (d) => {
    setInputError('');
    setScoreInput(prev => {
      const next = (prev === '0' ? '' : prev) + d;
      if (next.length > 3 || parseInt(next, 10) > 180) return prev;
      return next;
    });
  };

  const backspaceDigit = () => {
    setInputError('');
    setScoreInput(prev => prev.slice(0, -1));
  };

  const clearDigits = () => {
    setInputError('');
    setScoreInput('');
  };

  const finishTeam = (result, gsPlayer, checkout) => {
    const updated = [...games];
    updated[gameIdx] = { ...updated[gameIdx], result, gameShotPlayer: gsPlayer ?? null, checkout: checkout ?? null };
    setGames(updated);
    setPendingWin(false);
    setEndEarly(false);
  };

  const finishLeg = (legResult, checkout) => {
    const updated = [...games];
    const g = { ...updated[gameIdx] };
    const legs = g.legs.map(l => ({ ...l }));
    legs[legs.length - 1].result = legResult;
    legs[legs.length - 1].checkout = checkout ?? null;
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

  const askCheckout = (target) => {
    setCheckoutFor(target);
    setPendingWin(false);
    setScoreInput('');
    setInputError('');
  };

  const confirmCheckout = (skip) => {
    let co = null;
    if (!skip) {
      const v = parseInt(scoreInput, 10);
      const rem = remaining();
      if (isNaN(v) || v < 2 || v > 170) {
        setInputError('A checkout has to be between 2 and 170.');
        return;
      }
      if (BOGEY.includes(v)) {
        setInputError(`${v} can't be checked out in three darts.`);
        return;
      }
      if (v > rem) {
        setInputError(`Only ${rem} was left, so the checkout can't be more than that.`);
        return;
      }
      co = v;
    }
    if (checkoutFor.kind === 'team') finishTeam('win', checkoutFor.player, co);
    else finishLeg('win', co);
    setCheckoutFor(null);
    setScoreInput('');
    setInputError('');
  };

  const cancelCheckout = () => {
    if (checkoutFor.kind === 'team') setPendingWin(true);
    setCheckoutFor(null);
    setScoreInput('');
    setInputError('');
  };

  const nextGame = () => {
    setScoreInput(''); setInputError(''); setPendingWin(false); setEndEarly(false); setCheckoutFor(null);
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
    const st = players.map(() => ({ points: 0, visits: 0, gameShots: 0, wins: 0, losses: 0, games: 0, oneEighties: 0, tonForty: 0, ton: 0, highOut: null, byCat: {} }));
    const cat = (p, g) => {
      const c = categoryOf(g);
      if (!st[p].byCat[c]) st[p].byCat[c] = { points: 0, visits: 0, gameShots: 0 };
      return st[p].byCat[c];
    };
    const out = (p, co) => {
      if (co && (st[p].highOut === null || co > st[p].highOut)) st[p].highOut = co;
    };
    const tally = (p, s) => {
      if (s === 180) st[p].oneEighties++;
      else if (s >= 140) st[p].tonForty++;
      else if (s >= 100) st[p].ton++;
    };
    games.forEach(g => {
      if (g.kind === 'team') {
        g.playerIdxs.forEach(p => {
          st[p].games++;
          if (g.result === 'win') st[p].wins++;
          if (g.result === 'loss') st[p].losses++;
        });
        g.visits.forEach(v => {
          st[v.p].points += v.s; st[v.p].visits++; tally(v.p, v.s);
          const c = cat(v.p, g); c.points += v.s; c.visits++;
        });
        if (g.result === 'win' && g.gameShotPlayer !== null) {
          st[g.gameShotPlayer].gameShots++;
          cat(g.gameShotPlayer, g).gameShots++;
          out(g.gameShotPlayer, g.checkout);
        }
      } else if (g.player !== null) {
        st[g.player].games++;
        if (g.result === 'win') st[g.player].wins++;
        if (g.result === 'loss') st[g.player].losses++;
        const c = cat(g.player, g);
        g.legs.forEach(l => {
          l.visits.forEach(v => { st[g.player].points += v.s; st[g.player].visits++; tally(g.player, v.s); c.points += v.s; c.visits++; });
          if (l.result === 'win') { st[g.player].gameShots++; c.gameShots++; out(g.player, l.checkout); }
        });
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
    if (!s || s.visits === 0) return null;
    return (s.points + 60 * s.gameShots) / s.visits;
  };

  // Same layout as the club spreadsheet: an average per game type, an overall
  // that is the mean of those, and a team row that is the mean of each column.
  const averagesTable = (st) => {
    const cats = categoriesFor(teamSize);
    const rows = players.map((name, i) => {
      const byCat = cats.map(c => avgFor(st[i].byCat[c]));
      return { name, idx: i, byCat, overall: mean(byCat.filter(x => x !== null)) };
    });
    const teamByCat = cats.map((_, ci) => mean(rows.map(r => r.byCat[ci]).filter(x => x !== null)));
    const team = { byCat: teamByCat, overall: mean(teamByCat.filter(x => x !== null)) };
    rows.sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1));
    return { cats, rows, team };
  };

  const teamHighOut = (st) => {
    const best = Math.max(0, ...st.map(s => s.highOut ?? 0));
    if (!best) return null;
    return { value: best, names: players.filter((_, i) => st[i].highOut === best) };
  };

  const exportCSV = () => {
    const st = playerStats();
    const rec = teamRecord();
    const av = averagesTable(st);
    const hi = teamHighOut(st);
    let csv = 'DARTS MATCH SUMMARY\n';
    csv += `${ourTeam} v ${theirTeam}\n`;
    csv += `Date,${new Date().toLocaleDateString('en-GB')}\n\n`;
    csv += 'TEAM RESULT\n';
    csv += `Wins,${rec.w}\nLosses,${rec.l}\nGames,${rec.t}\n`;
    csv += `Highest checkout,${hi ? `${hi.value} (${hi.names.join(' & ')})` : ''}\n\n`;
    csv += 'AVERAGES BY GAME\n';
    csv += `,${av.cats.join(',')},Overall av.\n`;
    av.rows.forEach(r => {
      csv += `${r.name},${r.byCat.map(x => fmt(x) ?? '').join(',')},${fmt(r.overall) ?? ''}\n`;
    });
    csv += `Team,${av.team.byCat.map(x => fmt(x) ?? '').join(',')},${fmt(av.team.overall) ?? ''}\n\n`;
    csv += 'PLAYER STATS\n';
    csv += 'Player,Games,Wins,Losses,Visits,Darts,Points,Game Shots,180s,140+,100+,Highest Checkout\n';
    av.rows.forEach(({ name: p, idx: i }) => {
      const s = st[i];
      csv += `${p},${s.games},${s.wins},${s.losses},${s.visits},${s.visits * 3},${s.points},${s.gameShots},${s.oneEighties},${s.tonForty},${s.ton},${s.highOut ?? ''}\n`;
    });
    csv += '\nGAME BY GAME\n';
    csv += 'Game,Player,Scores,Result,Game Shot,Checkout\n';
    games.forEach(g => {
      if (g.kind === 'team') {
        g.playerIdxs.forEach(p => {
          const scores = g.visits.filter(v => v.p === p).map(v => v.s).join(' ');
          const gs = g.gameShotPlayer === p ? 'Yes' : '';
          const co = g.gameShotPlayer === p ? (g.checkout ?? '') : '';
          csv += `${g.name},${players[p]},${scores},${g.result ?? ''},${gs},${co}\n`;
        });
      } else if (g.player !== null) {
        g.legs.forEach((l, li) => {
          const scores = l.visits.map(v => v.s).join(' ');
          csv += `${g.name} leg ${li + 1},${players[g.player]},${scores},${l.result ?? ''},${l.result === 'win' ? 'Yes' : ''},${l.result === 'win' ? (l.checkout ?? '') : ''}\n`;
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
            <label className="ds-display text-sm uppercase tracking-widest" style={{ color: C.muted }}>Match format</label>
            <div className="flex gap-2 mt-1">
              <Btn onClick={() => chooseTeamSize(6)} color={C.green} outline={teamSize !== 6}>6 players</Btn>
              <Btn onClick={() => chooseTeamSize(8)} color={C.green} outline={teamSize !== 8}>8 players</Btn>
            </div>
            {teamSize === 8 && (
              <label className="flex items-center gap-2 text-sm mt-3" style={{ color: C.cream }}>
                <input
                  type="checkbox" checked={straightEightOpener}
                  onChange={e => setStraightEightOpener(e.target.checked)}
                  className="w-4 h-4"
                />
                Also play a Straight Eight to open the match (as well as the closer)
              </label>
            )}
          </div>

          <div>
            <label className="ds-display text-sm uppercase tracking-widest" style={{ color: C.muted }}>
              Playing order ({players.length}/{teamSize})
            </label>
            <div className="space-y-1.5 mt-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                  <span><span className="ds-display mr-2" style={{ color: C.brass }}>{i + 1}</span>{p}</span>
                  <button onClick={() => setPlayers(players.filter((_, j) => j !== i))} style={{ color: C.red }} className="text-sm">remove</button>
                </div>
              ))}
            </div>
            {players.length < teamSize && (
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

          <Btn onClick={startMatch} disabled={!ourTeam || !theirTeam || players.length !== teamSize} color={C.green} big>
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
    const showInput = !game.result && !onFinish && !endEarly && !pendingWin && !checkoutFor;

    const keypad = (
      <div className="grid grid-cols-3 gap-2 mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            onClick={() => appendDigit(String(n))}
            className="ds-display ds-num py-4 rounded text-2xl font-semibold transition-colors"
            style={{ background: C.panel, color: C.cream, border: `1px solid ${C.line}` }}
          >
            {n}
          </button>
        ))}
        <button onClick={clearDigits} className="ds-display py-4 rounded text-lg font-semibold uppercase transition-colors" style={{ background: C.panel, color: C.red, border: `1px solid ${C.line}` }}>C</button>
        <button onClick={() => appendDigit('0')} className="ds-display ds-num py-4 rounded text-2xl font-semibold transition-colors" style={{ background: C.panel, color: C.cream, border: `1px solid ${C.line}` }}>0</button>
        <button onClick={backspaceDigit} className="ds-display py-4 rounded text-xl font-semibold transition-colors" style={{ background: C.panel, color: C.cream, border: `1px solid ${C.line}` }}>⌫</button>
      </div>
    );

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
                      {l.result === 'win' ? `Won · GS +60${l.checkout ? ` · out ${l.checkout}` : ''}` : 'Lost'}
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
            <div className="rounded-lg px-4 py-3 mb-3 text-center" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
              <div className="ds-display uppercase tracking-widest text-xs mb-1" style={{ color: C.muted }}>
                {isTeam ? `${players[throwerIdx()]} to throw` : 'Enter score'}
              </div>
              <div className="ds-display ds-num font-bold leading-none" style={{ fontSize: '2.75rem', color: scoreInput ? C.cream : C.muted }}>
                {scoreInput || '0'}
              </div>
            </div>

            {keypad}

            <div className="flex gap-2">
              <button onClick={undoScore} className="ds-display px-5 rounded uppercase font-semibold" style={{ background: C.panel, color: C.red, border: `1px solid ${C.line}` }}>Undo</button>
              <button onClick={submitScore} className="ds-display flex-1 py-3 rounded uppercase font-semibold text-lg" style={{ background: C.green, color: C.cream }}>Enter</button>
            </div>

            {inputError && <p className="text-sm mt-2" style={{ color: C.red }}>{inputError}</p>}
            <button onClick={() => setEndEarly(true)} className="text-sm mt-3 underline" style={{ color: C.muted }}>
              Game's finished already? Record the result
            </button>
          </div>
        )}

        {/* result flow */}
        {!game.result && (onFinish || endEarly) && !pendingWin && !checkoutFor && (
          <div className="rounded-lg p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
            <div className="ds-display uppercase tracking-wide mb-3">{isTeam ? 'How did it end?' : `Leg ${legNo}: how did it end?`}</div>
            <div className="flex gap-3">
              <Btn onClick={() => { if (isTeam) { setPendingWin(true); } else { askCheckout({ kind: 'leg' }); } }} color={C.green} big>
                {isTeam ? 'We won' : 'Won the leg'}
              </Btn>
              <Btn onClick={() => { if (isTeam) { finishTeam('loss'); } else { finishLeg('loss'); } }} color={C.red} big>
                {isTeam ? 'We lost' : 'Lost the leg'}
              </Btn>
            </div>
            {!isTeam && <p className="text-sm mt-3" style={{ color: C.muted }}>A won leg is the game shot: {players[game.player]} gets 60 added, no darts counted.</p>}
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
                <Btn key={p} onClick={() => askCheckout({ kind: 'team', player: p })} color={C.brassDim}>{players[p]}</Btn>
              ))}
            </div>
            <button onClick={() => setPendingWin(false)} className="text-sm mt-3 underline" style={{ color: C.muted }}>Back</button>
          </div>
        )}

        {checkoutFor && (
          <div className="mb-4">
            <div className="rounded-lg px-4 py-3 mb-3 text-center" style={{ background: C.panel, border: `1px solid ${C.brass}` }}>
              <div className="ds-display uppercase tracking-widest text-xs mb-1" style={{ color: C.brass }}>
                {players[checkoutFor.kind === 'team' ? checkoutFor.player : game.player]} checked out on
              </div>
              <div className="ds-display ds-num font-bold leading-none" style={{ fontSize: '2.75rem', color: scoreInput ? C.cream : C.muted }}>
                {scoreInput || '0'}
              </div>
            </div>
            {keypad}
            <div className="flex gap-2">
              <button onClick={() => confirmCheckout(true)} className="ds-display px-5 rounded uppercase font-semibold" style={{ background: C.panel, color: C.muted, border: `1px solid ${C.line}` }}>Skip</button>
              <button onClick={() => confirmCheckout(false)} className="ds-display flex-1 py-3 rounded uppercase font-semibold text-lg" style={{ background: C.green, color: C.cream }}>Save checkout</button>
            </div>
            {inputError && <p className="text-sm mt-2" style={{ color: C.red }}>{inputError}</p>}
            <button onClick={cancelCheckout} className="text-sm mt-3 underline" style={{ color: C.muted }}>Back</button>
          </div>
        )}

        {game.result && (
          <div>
            <div className="rounded-lg p-4 text-center mb-4" style={{ background: game.result === 'win' ? C.greenDeep : C.red, border: `1px solid ${game.result === 'win' ? C.green : C.red}` }}>
              <div className="ds-display text-2xl uppercase tracking-wide font-semibold">
                {game.result === 'win' ? 'Game won' : 'Game lost'}
              </div>
              {isTeam && game.gameShotPlayer !== null && (
                <div className="text-sm mt-1" style={{ color: C.cream }}>
                  Game shot: {players[game.gameShotPlayer]} (+60){game.checkout ? ` · checked out ${game.checkout}` : ''}
                </div>
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
    const st = playerStats();
    const rec = teamRecord();
    const av = averagesTable(st);
    const hi = teamHighOut(st);
    const cell = (n) => fmt(n) ?? '\u2014';
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

        <div className="rounded-lg p-5 mb-4 text-center" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="ds-display uppercase tracking-widest text-sm" style={{ color: C.muted }}>Highest checkout</div>
          <div className="ds-display ds-num text-5xl font-bold mt-1" style={{ color: hi ? C.brass : C.muted }}>{hi ? hi.value : '\u2014'}</div>
          <div className="ds-display uppercase tracking-wide mt-1">{hi ? hi.names.join(' & ') : 'None recorded'}</div>
        </div>

        <div className="rounded-lg p-4 mb-4 overflow-x-auto" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="ds-display uppercase tracking-wide mb-2" style={{ color: C.brass }}>Averages</div>
          <table className="w-full text-sm ds-num">
            <thead>
              <tr className="ds-display uppercase" style={{ color: C.muted }}>
                <th className="py-1.5 pr-2 font-medium text-left"></th>
                {av.cats.map(c => <th key={c} className="py-1.5 px-1 font-medium text-right">{c}</th>)}
                <th className="py-1.5 pl-2 font-medium text-right" style={{ color: C.cream }}>Overall av.</th>
              </tr>
            </thead>
            <tbody>
              {av.rows.map(r => (
                <tr key={r.idx} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="py-2 pr-2">{r.name}</td>
                  {r.byCat.map((x, ci) => (
                    <td key={ci} className="py-2 px-1 text-right" style={{ color: x === null ? C.muted : C.cream }}>{cell(x)}</td>
                  ))}
                  <td className="py-2 pl-2 text-right ds-display text-base font-semibold">{cell(r.overall)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${C.muted}` }}>
                <td className="py-2 pr-2 ds-display uppercase font-semibold" style={{ color: C.brass }}>Team</td>
                {av.team.byCat.map((x, ci) => (
                  <td key={ci} className="py-2 px-1 text-right font-semibold" style={{ color: C.brass }}>{cell(x)}</td>
                ))}
                <td className="py-2 pl-2 text-right ds-display text-base font-bold" style={{ color: C.brass }}>{cell(av.team.overall)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs mt-2" style={{ color: C.muted }}>
            Average is per visit (3 darts). Each game shot adds 60 with no darts counted. Overall av. is the average of the game types a player played. The team row is the average of the players above it.
          </p>
        </div>

        <div className="rounded-lg p-4 mb-4 overflow-x-auto" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <div className="ds-display uppercase tracking-wide mb-2" style={{ color: C.brass }}>Player stats</div>
          <table className="w-full text-sm ds-num">
            <thead>
              <tr className="ds-display uppercase text-left" style={{ color: C.muted }}>
                <th className="py-1.5 pr-2 font-medium">Player</th>
                <th className="py-1.5 px-1 font-medium text-center">P</th>
                <th className="py-1.5 px-1 font-medium text-center">W</th>
                <th className="py-1.5 px-1 font-medium text-center">L</th>
                <th className="py-1.5 px-1 font-medium text-center">GS</th>
                <th className="py-1.5 px-1 font-medium text-center">180</th>
                <th className="py-1.5 px-1 font-medium text-center">140+</th>
                <th className="py-1.5 px-1 font-medium text-center">100+</th>
                <th className="py-1.5 pl-1 font-medium text-right">High out</th>
              </tr>
            </thead>
            <tbody>
              {av.rows.map(({ name: p, idx: i }) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="py-2 pr-2">{p}</td>
                  <td className="py-2 px-1 text-center" style={{ color: C.muted }}>{st[i].games}</td>
                  <td className="py-2 px-1 text-center" style={{ color: C.green }}>{st[i].wins}</td>
                  <td className="py-2 px-1 text-center" style={{ color: C.red }}>{st[i].losses}</td>
                  <td className="py-2 px-1 text-center" style={{ color: C.brass }}>{st[i].gameShots}</td>
                  <td className="py-2 px-1 text-center" style={{ color: st[i].oneEighties ? C.brass : C.muted }}>{st[i].oneEighties || '\u2014'}</td>
                  <td className="py-2 px-1 text-center" style={{ color: st[i].tonForty ? C.cream : C.muted }}>{st[i].tonForty || '\u2014'}</td>
                  <td className="py-2 px-1 text-center" style={{ color: st[i].ton ? C.cream : C.muted }}>{st[i].ton || '\u2014'}</td>
                  <td className="py-2 pl-1 text-right ds-display text-base font-semibold" style={{ color: st[i].highOut ? C.cream : C.muted }}>{st[i].highOut ?? '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                  Game shot: {players[g.gameShotPlayer]}{g.checkout ? ` (out ${g.checkout})` : ''}
                </div>
              )}
              {g.kind === 'singles' && g.player !== null && (
                <div className="text-xs mt-0.5" style={{ color: C.muted }}>
                  Legs {g.legs.filter(l => l.result === 'win').length}&ndash;{g.legs.filter(l => l.result === 'loss').length}
                  {g.legs.some(l => l.checkout) && ` \u00b7 out ${g.legs.filter(l => l.checkout).map(l => l.checkout).join(', ')}`}
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
