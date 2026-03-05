import { useState, useEffect } from 'react'
import Papa from 'papaparse'

/**
 * Fetches and parses a CSV from the /public/data/ folder.
 * Because Vite serves /public as static assets, any change to the CSV
 * (and a browser refresh) will immediately reflect updated data.
 */
function parseCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

export function useCropData() {
  const [cropRows, setCropRows]     = useState([])
  const [irrigRows, setIrrigRows]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      parseCSV('/data/crop_yield.csv'),
      parseCSV('/data/irrigation.csv'),
    ])
      .then(([crops, irrig]) => {
        setCropRows(crops)
        setIrrigRows(irrig)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'Failed to load data')
        setLoading(false)
      })
  }, [])

  // ── Derived helpers ──────────────────────────────────────────────────────

  /** All unique crops sorted A-Z */
  const allCrops = [...new Set(cropRows.map(r => r.Crop?.trim()).filter(Boolean))].sort()

  /** All unique states sorted A-Z */
  const allStates = [...new Set(cropRows.map(r => r.State?.trim()).filter(Boolean))].sort()

  /** All unique seasons */
  const allSeasons = [...new Set(cropRows.map(r => r.Season?.trim()).filter(Boolean))].sort()

  /**
   * Returns aggregated yield stats for a given crop + state + season filter.
   * If season is 'All', it uses all seasons.
   */
  function getYieldStats({ crop, state, season }) {
    let rows = cropRows.filter(r => {
      const cropMatch    = !crop   || r.Crop?.trim() === crop
      const stateMatch   = !state  || r.State?.trim() === state
      const seasonMatch  = !season || season === 'All' || r.Season?.trim() === season
      return cropMatch && stateMatch && seasonMatch
    })

    if (rows.length === 0) return null

    const yields      = rows.map(r => parseFloat(r.Yield)).filter(v => !isNaN(v))
    const areas       = rows.map(r => parseFloat(r.Area)).filter(v => !isNaN(v))
    const productions = rows.map(r => parseFloat(r.Production)).filter(v => !isNaN(v))
    const rainfalls   = rows.map(r => parseFloat(r.Annual_Rainfall)).filter(v => !isNaN(v))
    const fertilizers = rows.map(r => parseFloat(r.Fertilizer)).filter(v => !isNaN(v))

    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    const max = (arr) => arr.length ? Math.max(...arr) : 0

    // Year-wise trend (last 10 years available)
    const byYear = {}
    rows.forEach(r => {
      const y = parseInt(r.Crop_Year)
      const v = parseFloat(r.Yield)
      if (!isNaN(y) && !isNaN(v)) {
        if (!byYear[y]) byYear[y] = []
        byYear[y].push(v)
      }
    })
    const trend = Object.entries(byYear)
      .map(([yr, vals]) => ({ year: parseInt(yr), avgYield: avg(vals) }))
      .sort((a, b) => a.year - b.year)
      .slice(-10)

    return {
      avgYield:       avg(yields),
      maxYield:       max(yields),
      avgArea:        avg(areas),
      avgProduction:  avg(productions),
      avgRainfall:    avg(rainfalls),
      avgFertilizer:  avg(fertilizers),
      recordCount:    rows.length,
      trend,
    }
  }

  /**
   * Latest irrigation data for a given state
   */
  function getIrrigationStats(state) {
    const rows = irrigRows.filter(r => r.snames?.trim() === state)
    if (!rows.length) return null
    const latest = rows.sort((a, b) => parseInt(b.year) - parseInt(a.year))[0]
    return {
      year:      latest.year,
      sw:        parseFloat(latest.nia_sw)  || 0,
      gw:        parseFloat(latest.nia_gw)  || 0,
      others:    parseFloat(latest.nia_others) || 0,
      total:     parseFloat(latest.tnia)    || 0,
    }
  }

  return {
    loading, error,
    allCrops, allStates, allSeasons,
    getYieldStats, getIrrigationStats,
  }
}
