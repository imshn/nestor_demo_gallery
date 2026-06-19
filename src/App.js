import React, { useEffect, useMemo, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Sun01Icon, Moon02Icon, Cancel01Icon, PlayIcon, Search01Icon } from '@hugeicons/core-free-icons'
import styles from './App.module.css'
import Assets from './Assets.json'

const ADN_BASE_URL = process.env.REACT_APP_ADN_BASE_URL || '';
const DOMAIN_ID = process.env.REACT_APP_DOMAIN_ID || '';
const ENV_ID = process.env.REACT_APP_ENV_ID || '';
const THEME_KEY = 'nestor-gallery-theme'

const SERVICES = [
  { label: 'ADN v1', value: 'https://adn.nestortech.io/api/va/' },
  { label: 'ADN delta v2', value: 'https://adn-v2-delta.vercel.app/api/va/' },
]

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [selectedService, setSelectedService] = useState(SERVICES[0].value)
  const [activeAsset, setActiveAsset] = useState(null)
  const [loadedKeys, setLoadedKeys] = useState({})
  const [benchmark, setBenchmark] = useState({ status: 'idle', results: {} })
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const lightboxCloseRef = useRef(null)
  const lastFocusedTileRef = useRef(null)

  useEffect(() => {
    if (!activeAsset) {
      lastFocusedTileRef.current?.focus()
      return
    }
    lightboxCloseRef.current?.focus()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveAsset(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeAsset])

  const platforms = useMemo(
    () => ['all', ...new Set(Assets.map((asset) => asset.targetPlatform))],
    []
  )

  const filteredAssets = Assets.filter((asset) => {
    const matchesQuery =
      asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.targetPlatform.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = platformFilter === 'all' || asset.targetPlatform === platformFilter
    return matchesQuery && matchesPlatform
  })

  const assetUrl = (asset, baseUrl = selectedService) =>
    `${baseUrl}${DOMAIN_ID}/${asset.assetId}/${ENV_ID}/${asset.targetPlatform}`

  const markLoaded = (key) => setLoadedKeys((prev) => ({ ...prev, [key]: true }))

  const imageSamples = useMemo(() => Assets.filter((asset) => !asset.isVideo), [])
  const videoSamples = useMemo(() => Assets.filter((asset) => asset.isVideo), [])

  const bench = (url) => `${url}?bench=${Date.now()}-${Math.random()}`

  const timeOneImageLoad = (url) =>
    new Promise((resolve) => {
      const start = performance.now()
      const img = new Image()
      img.onload = () => resolve(performance.now() - start)
      img.onerror = () => resolve(null)
      img.src = bench(url)
    })

  const timeOneVideoLoad = (url) =>
    new Promise((resolve) => {
      const start = performance.now()
      const video = document.createElement('video')
      video.preload = 'auto'
      video.muted = true
      video.oncanplaythrough = () => resolve(performance.now() - start)
      video.onerror = () => resolve(null)
      video.src = bench(url)
    })

  const runBenchmark = async () => {
    setBenchmark({ status: 'running', results: {} })
    const results = {}
    for (const service of SERVICES) {
      const imageTimings = []
      for (const asset of imageSamples) {
        const elapsed = await timeOneImageLoad(assetUrl(asset, service.value))
        if (elapsed !== null) imageTimings.push(elapsed)
      }
      const videoTimings = []
      for (const asset of videoSamples) {
        const elapsed = await timeOneVideoLoad(assetUrl(asset, service.value))
        if (elapsed !== null) videoTimings.push(elapsed)
      }
      results[service.value] = { image: imageTimings, video: videoTimings }
      setBenchmark({ status: 'running', results: { ...results } })
    }
    setBenchmark({ status: 'done', results })
  }

  const renderTile = (asset, index) => {
    const key = `${asset.assetId}-${asset.targetPlatform}-${index}`
    const url = assetUrl(asset)
    const isLoaded = !!loadedKeys[key]

    return (
      <button
        key={key}
        className={styles.tile}
        onClick={(e) => {
          lastFocusedTileRef.current = e.currentTarget
          setActiveAsset({ ...asset, url })
        }}
        aria-label={`Open ${asset.assetId}, ${asset.targetPlatform}`}
      >
        <div className={styles.tileMedia}>
          {!isLoaded && <div className={styles.tileSkeleton} />}
          {asset.isVideo ? (
            <video
              className={styles.media}
              muted
              playsInline
              preload="metadata"
              onLoadedData={() => markLoaded(key)}
              style={{ opacity: isLoaded ? 1 : 0 }}
            >
              <source src={url} type="video/mp4" />
            </video>
          ) : (
            <img
              className={styles.media}
              src={url}
              alt={asset.assetId}
              loading="lazy"
              onLoad={() => markLoaded(key)}
              style={{ opacity: isLoaded ? 1 : 0 }}
            />
          )}
          {asset.isVideo && (
            <span className={styles.playBadge}>
              <HugeiconsIcon icon={PlayIcon} size={14} />
            </span>
          )}
        </div>
        <div className={styles.tileMeta}>
          <span className={styles.tileId}>{asset.assetId}</span>
          <span className={styles.tileMetaPlatform}>{asset.targetPlatform}</span>
        </div>
      </button>
    )
  }

  const missingConfig = !ADN_BASE_URL || !DOMAIN_ID || !ENV_ID

  const statsFor = (category) => {
    const stats = SERVICES.map((service) => {
      const timings = (benchmark.results[service.value] || {})[category] || []
      const avg = timings.length ? timings.reduce((a, b) => a + b, 0) / timings.length : null
      return {
        service,
        avg,
        min: timings.length ? Math.min(...timings) : null,
        samples: timings.length,
      }
    })
    const validAverages = stats.map((s) => s.avg).filter((avg) => avg !== null)
    return {
      stats,
      slowestAvg: validAverages.length ? Math.max(...validAverages) : null,
      fastestAvg: validAverages.length ? Math.min(...validAverages) : null,
    }
  }

  const imageStats = statsFor('image')
  const videoStats = statsFor('video')

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerActions}>
            <select
              className={styles.serviceSelector}
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              aria-label="Select delivery service"
            >
              <option value="" disabled>
                Select a service
              </option>
              {SERVICES.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <HugeiconsIcon icon={theme === 'dark' ? Sun01Icon : Moon02Icon} size={18} />
            </button>
          </div>
        </div>

        <h1 className={styles.title}>The Gallery</h1>
        <p className={styles.subtitle}>
          {ENV_ID ? (
            <>
              Every render Nestor has delivered across environment{' '}
              <span className={styles.tag}>{ENV_ID}</span>, organized by platform and ready to
              inspect.
            </>
          ) : (
            'Every render Nestor has delivered, organized by platform and ready to inspect.'
          )}
        </p>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <HugeiconsIcon icon={Search01Icon} size={16} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search by asset or platform"
              aria-label="Search assets"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.pillRow}>
            {platforms.map((platform) => (
              <button
                key={platform}
                className={`${styles.pill} ${platformFilter === platform ? styles.pillActive : ''}`}
                onClick={() => setPlatformFilter(platform)}
                aria-pressed={platformFilter === platform}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.perfPanel}>
        <div className={styles.perfHeader}>
          <div>
            <h2 className={styles.perfTitle}>Service speed</h2>
            <p className={styles.perfHint}>
              Loads {imageSamples.length} images and {videoSamples.length} videos from each
              service and times them.
            </p>
          </div>
          <button
            type="button"
            className={styles.perfRun}
            onClick={runBenchmark}
            disabled={missingConfig || benchmark.status === 'running'}
          >
            {benchmark.status === 'running' ? 'Testing...' : 'Run speed test'}
          </button>
        </div>

        {benchmark.status !== 'idle' && (
          <div className={styles.perfCategories} aria-live="polite">
            {[
              { key: 'image', label: 'Images', data: imageStats },
              { key: 'video', label: 'Videos', data: videoStats },
            ].map(({ key, label, data }) => (
              <div key={key} className={styles.perfCategory}>
                <h3 className={styles.perfCategoryLabel}>{label}</h3>
                <div className={styles.perfRows}>
                  {data.stats.map(({ service, avg, min, samples }) => {
                    const isFastest =
                      avg !== null && avg === data.fastestAvg && data.fastestAvg !== data.slowestAvg
                    const barWidth =
                      avg !== null && data.slowestAvg ? Math.max(8, (avg / data.slowestAvg) * 100) : 0
                    return (
                      <div key={service.value} className={styles.perfRow}>
                        <div className={styles.perfRowLabel}>
                          <span>{service.label}</span>
                          {isFastest && <span className={styles.perfBadge}>Fastest</span>}
                        </div>
                        <div className={styles.perfBarTrack}>
                          <div
                            className={styles.perfBarFill}
                            style={{ width: avg !== null ? `${barWidth}%` : '0%' }}
                          />
                        </div>
                        <div className={styles.perfRowValue}>
                          {avg !== null
                            ? `${avg.toFixed(0)} ms avg · ${min.toFixed(0)} ms best · ${samples} samples`
                            : benchmark.status === 'running'
                            ? 'Testing...'
                            : 'No successful loads'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <main className={styles.gallery}>
        {missingConfig ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Configuration missing</h2>
            <p className={styles.emptyBody}>
              Set REACT_APP_ADN_BASE_URL, REACT_APP_DOMAIN_ID and REACT_APP_ENV_ID to load assets.
            </p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No matches</h2>
            <p className={styles.emptyBody}>Try a different search term or platform.</p>
          </div>
        ) : (
          filteredAssets.map(renderTile)
        )}
      </main>

      {activeAsset && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveAsset(null)}
        >
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button
              ref={lightboxCloseRef}
              className={styles.lightboxClose}
              onClick={() => setActiveAsset(null)}
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
            {activeAsset.isVideo ? (
              <video className={styles.lightboxMedia} controls autoPlay>
                <source src={activeAsset.url} type="video/mp4" />
              </video>
            ) : (
              <img className={styles.lightboxMedia} src={activeAsset.url} alt={activeAsset.assetId} />
            )}
            <div className={styles.lightboxMeta}>
              <span>{activeAsset.assetId}</span>
              <span className={styles.tilePlatform}>{activeAsset.targetPlatform}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
