# Darts Scorer

A digital scoring app for team darts matches, replacing the paper scoresheets.

## Match Format

The app follows the full team match structure:

1. 1st 6v6
2. 1st 3v3 (players 1-3)
3. 2nd 3v3 (players 4-6)
4. 1st 2v2 (players 1-2)
5. 2nd 2v2 (players 3-4)
6. 3rd 2v2 (players 5-6)
7. Singles (drawn at random, chosen from remaining players)
8. Final 6v6

## Features

- Enter your 6 players in order and they auto-fill for each game
- Singles player picker that removes players once they have played
- Quick score entry (type and press enter)
- Win/loss and game shot recording per game
- Player averages with a 60-point (3 dart) bonus for each game shot
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
