# Farmer's Companion — Setup Guide

## Folder Structure

```
Farmer's Companion/
├── public/
│   └── data/
│       ├── crop_yield.csv      ← your data lives here
│       └── irrigation.csv      ← your data lives here
├── src/
│   ├── App.jsx
│   ├── useCropData.js
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## One-time Setup

1. Open a terminal in this folder and run:
   ```bash
   npm install
   ```

2. Copy your CSV files into `public/data/`:
   - `crop_yield.csv`
   - `irrigation.csv`

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser.

## Updating Data

- Edit `public/data/crop_yield.csv` or `irrigation.csv` in any editor.
- **Refresh the browser** — the app re-reads the CSVs on every page load.
- No server restart needed.

## CSV Format Expected

### crop_yield.csv
```
Crop, Crop_Year, Season, State, Area, Production, Annual_Rainfall, Fertilizer, Pesticide, Yield
```

### irrigation.csv
```
snames, year, nia_sw, nia_gw, nia_others, tnia, tgia
```
