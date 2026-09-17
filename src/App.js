import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Sun01Icon,
  Moon02Icon,
  Cancel01Icon,
  PlayIcon,
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import styles from './App.module.css'
import Assets from './Assets.json'

const ADN_BASE_URL = process.env.REACT_APP_ADN_BASE_URL || '';
const DOMAIN_ID = process.env.REACT_APP_DOMAIN_ID || '';
const ENV_ID = process.env.REACT_APP_ENV_ID || '';
const THEME_KEY = 'umber-gallery-theme'

// e.g. "https://teal-vicuna-9538.umberadn.com/api/va/" -> "https://teal-vicuna-9538.umberadn.com/api/"
const ADN_API_ROOT = ADN_BASE_URL.replace(/va\/?$/, '')
const collectionUrl = (collectionId) =>
  `${ADN_API_ROOT}vc/${DOMAIN_ID}/${collectionId}/${ENV_ID}`
const collectionMediaUrl = (downloadUrl) => `${ADN_API_ROOT}vi${downloadUrl}`
const COLLECTION_POLL_MS = 8000
const COLLECTION_ID = process.env.REACT_APP_COLLECTION_ID || 'iphone'

// Anchor asset first, then the rest of the collection in API order
const collectionItemsFromData = (data) => {
  const isMedia = (item) =>
    item.mimetype && (item.mimetype.startsWith('image/') || item.mimetype.startsWith('video/'))
  const toItem = (item) => ({
    assetItemId: item.assetItemId,
    url: collectionMediaUrl(item.downloadUrl),
    isVideo: item.mimetype.startsWith('video/'),
  })
  const all = (data.assetItemUrls || []).filter(isMedia)
  const anchorId = data.anchorAsset && data.anchorAsset.assetItemId
  const ordered = anchorId
    ? [...all.filter((i) => i.assetItemId === anchorId), ...all.filter((i) => i.assetItemId !== anchorId)]
    : all
  return ordered.map(toItem)
}

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const selectedService = ADN_BASE_URL
  const [activeAsset, setActiveAsset] = useState(null)
  const [loadedKeys, setLoadedKeys] = useState({})
  const [benchmark, setBenchmark] = useState({ status: 'idle', results: {} })
  const [collectionState, setCollectionState] = useState({ status: 'idle', id: null, items: [] })
  const [slideIndex, setSlideIndex] = useState(0)
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
    const imageTimings = []
    for (const asset of imageSamples) {
      const elapsed = await timeOneImageLoad(assetUrl(asset))
      if (elapsed !== null) imageTimings.push(elapsed)
      setBenchmark({ status: 'running', results: { image: imageTimings, video: [] } })
    }
    const videoTimings = []
    for (const asset of videoSamples) {
      const elapsed = await timeOneVideoLoad(assetUrl(asset))
      if (elapsed !== null) videoTimings.push(elapsed)
      setBenchmark({ status: 'running', results: { image: imageTimings, video: videoTimings } })
    }
    setBenchmark({ status: 'done', results: { image: imageTimings, video: videoTimings } })
  }

  const fetchCollection = useCallback(async (collectionId, { silent } = {}) => {
    if (!silent) setCollectionState({ status: 'loading', id: collectionId, items: [] })
    try {
      const res = await fetch(collectionUrl(collectionId))
      if (!res.ok) throw new Error(`Request failed with ${res.status}`)
      const data = await res.json()
      const items = collectionItemsFromData(data)
      setCollectionState((prev) => {
        // a newer load (different id) may have started while this was in flight
        if (silent && prev.id !== collectionId) return prev
        return { status: items.length ? 'done' : 'empty', id: collectionId, items }
      })
    } catch (err) {
      if (!silent) setCollectionState({ status: 'error', id: collectionId, items: [], error: err.message })
    }
  }, [])

  // Load the collection once on mount, then keep polling so newly added
  // asset items show up without a page reload
  useEffect(() => {
    fetchCollection(COLLECTION_ID)
  }, [fetchCollection])

  const collectionStatus = collectionState.status
  const collectionId = collectionState.id
  useEffect(() => {
    if (collectionStatus !== 'done' && collectionStatus !== 'empty') return
    const timer = setInterval(() => fetchCollection(collectionId, { silent: true }), COLLECTION_POLL_MS)
    return () => clearInterval(timer)
  }, [collectionStatus, collectionId, fetchCollection])

  useEffect(() => {
    setSlideIndex((i) => Math.min(i, Math.max(collectionState.items.length - 1, 0)))
  }, [collectionState.items.length])

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
    const timings = benchmark.results[category] || []
    const avg = timings.length ? timings.reduce((a, b) => a + b, 0) / timings.length : null
    return {
      avg,
      min: timings.length ? Math.min(...timings) : null,
      samples: timings.length,
    }
  }

  const imageStats = statsFor('image')
  const videoStats = statsFor('video')

  const activeSlide = collectionState.items[slideIndex]
  const slideCount = collectionState.items.length

  const renderCollectionTile = () => {
    if (collectionState.status === 'idle' || collectionState.status === 'loading') {
      return (
        <div key="collection-tile" className={`${styles.tile} ${styles.collectionTile}`}>
          <div className={styles.collectionTilePlaceholder}>Loading collection…</div>
        </div>
      )
    }
    if (!activeSlide) return null

    return (
      <div key="collection-tile" className={`${styles.tile} ${styles.collectionTile}`}>
        <button
          type="button"
          className={styles.collectionTileMedia}
          onClick={() =>
            setActiveAsset({
              assetId: activeSlide.assetItemId,
              targetPlatform: collectionState.id,
              isVideo: activeSlide.isVideo,
              url: activeSlide.url,
            })
          }
          aria-label={`Open ${activeSlide.assetItemId}`}
        >
          {activeSlide.isVideo ? (
            <video key={activeSlide.url} className={styles.collectionMediaFit} muted playsInline autoPlay loop preload="metadata">
              <source src={activeSlide.url} type="video/mp4" />
            </video>
          ) : (
            <img className={styles.collectionMediaFit} src={activeSlide.url} alt={activeSlide.assetItemId} />
          )}
          {slideIndex === 0 && <span className={styles.collectionAnchorBadge}>Anchor</span>}
        </button>

        {slideCount > 1 && (
          <>
            <button
              type="button"
              className={`${styles.collectionArrow} ${styles.collectionArrowLeft}`}
              onClick={(e) => {
                e.stopPropagation()
                setSlideIndex((i) => (i - 1 + slideCount) % slideCount)
              }}
              aria-label="Previous asset"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            </button>
            <button
              type="button"
              className={`${styles.collectionArrow} ${styles.collectionArrowRight}`}
              onClick={(e) => {
                e.stopPropagation()
                setSlideIndex((i) => (i + 1) % slideCount)
              }}
              aria-label="Next asset"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
            <div className={styles.collectionDots}>
              {collectionState.items.map((item, index) => (
                <button
                  key={item.assetItemId || index}
                  type="button"
                  className={`${styles.collectionDot} ${index === slideIndex ? styles.collectionDotActive : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSlideIndex(index)
                  }}
                  aria-label={`Show asset ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className={styles.tileMeta}>
          <span className={styles.tileId}>{collectionState.id}</span>
          <span className={styles.tileMetaPlatform}>collection</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerActions}>
            <span className={styles.serviceLabel}>ADN v1</span>

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
              Every render Umber has delivered across environment{' '}
              <span className={styles.tag}>{ENV_ID}</span>, organized by platform and ready to
              inspect.
            </>
          ) : (
            'Every render Umber has delivered, organized by platform and ready to inspect.'
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

          <span className={styles.assetCount}>{filteredAssets.length} assets</span>
        </div>
      </header>

      <section className={styles.perfPanel}>
        <div className={styles.perfHeader}>
          <div>
            <h2 className={styles.perfTitle}>Service speed</h2>
            <p className={styles.perfHint}>
              Loads {imageSamples.length} images and {videoSamples.length} videos from the
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
                  <div className={styles.perfRow}>
                    <div className={styles.perfRowLabel}>
                      <span>ADN v1</span>
                    </div>
                    <div className={styles.perfBarTrack}>
                      <div
                        className={styles.perfBarFill}
                        style={{ width: data.avg !== null ? '100%' : '0%' }}
                      />
                    </div>
                    <div className={styles.perfRowValue}>
                      {data.avg !== null
                        ? `${data.avg.toFixed(0)} ms avg · ${data.min.toFixed(0)} ms best · ${data.samples} samples`
                        : benchmark.status === 'running'
                        ? 'Testing...'
                        : 'No successful loads'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <main className={styles.gallery}>
        {renderCollectionTile()}
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
