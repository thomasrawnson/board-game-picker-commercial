# ShelfPick Frontend

React and TypeScript frontend for ShelfPick.

The interface is designed as a mobile-first game-night experience and currently includes:

- player-count and play-time selection
- ranked game recommendations
- BoardGameGeek game artwork
- explainable match scores
- play-history recording
- collection insights
- installable PWA support

## Development

Install dependencies:

```bash
npm ci
```

The frontend uses Node.js 22. The repository root `.node-version` and this
package's `engines` declaration carry the same constraint for local tools and
Render builds.

Start the development server:

```bash
npm run dev
```
