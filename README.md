# Darts Scorer

A digital scoring app for team darts matches, replacing the paper scoresheets.

## Match Format

Before the match you choose the format by tapping buttons:

1. **How many players:** 6 or 8.
2. **Order of games:** tap the game types in the order you'll play them.
   - 6 players: 1v1, 2v2, 3v3 and 6v6
   - 8 players: 1v1, 2v2, 4v4 and 8v8 (the Straight Eight)
   - Every game type has to go in at least once.
   - The 6v6 or 8v8 can open the match, close it, or both.
   - "Use the usual order" fills in the standard running order for you.

Pairs, threes and fours are set by playing order (players 1 and 2 are partners, and so on). When a block comes round, you pick which pair, three or four plays next. Singles players are picked the same way, from those who haven't played yet.

Starting scores: singles 501, 2v2 601, 3v3 701, 4v4 and 6v6 801, 8v8 1001.

## Features

- Enter your players in order and they auto-fill for each game
- Singles player picker that removes players once they have played
- Quick score entry (type and press enter)
- Win/loss and game shot recording per game
- Player averages with a 60-point (3 dart) bonus for each game shot
- Averages table split by game type (Singles, Pairs, Threes, 6v6 or Fours, Straight 8) with an overall average and a team row, laid out like the club spreadsheet
- Checkout entry after each win, with highest checkout per player and for the match
- Full match summary and CSV export

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

Deployed on Netlify.
