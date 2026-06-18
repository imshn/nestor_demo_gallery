import React, { useEffect, useMemo, useState } from 'react'
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
  const [selectedService, setSelectedService] = useState(ADN_BASE_URL)
  const [activeAsset, setActiveAsset] = useState(null)
  const [loadedKeys, setLoadedKeys] = useState({})
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

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

  const assetUrl = (asset) =>
    `${selectedService}${DOMAIN_ID}/${asset.assetId}/${ENV_ID}/${asset.targetPlatform}`

  const markLoaded = (key) => setLoadedKeys((prev) => ({ ...prev, [key]: true }))

  const renderTile = (asset, index) => {
    const key = `${asset.assetId}-${asset.targetPlatform}-${index}`
    const url = assetUrl(asset)
    const isLoaded = !!loadedKeys[key]

    return (
      <button
        key={key}
        className={styles.tile}
        onClick={() => setActiveAsset({ ...asset, url })}
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
          {asset.isVideo && <span className={styles.playBadge}>&#9656;</span>}
        </div>
        <div className={styles.tileMeta}>
          <span className={styles.tileId}>{asset.assetId}</span>
          <span className={styles.tilePlatform}>{asset.targetPlatform}</span>
        </div>
      </button>
    )
  }

  const missingConfig = !ADN_BASE_URL || !DOMAIN_ID || !ENV_ID

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.eyebrow}>Delivery network archive</span>
          <div className={styles.headerActions}>
            <select
              className={styles.serviceSelector}
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
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
              {theme === 'dark' ? '☀' : '☽'}
            </button>
          </div>
        </div>

        <h1 className={styles.title}>The Gallery</h1>
        <p className={styles.subtitle}>
          Every render Nestor has delivered across environment{' '}
          <span className={styles.tag}>{ENV_ID || 'unset'}</span>, organized by platform and ready
          to inspect.
        </p>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              type="search"
              placeholder="Search by asset or platform"
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
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className={styles.gallery}>
        {missingConfig ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Configuration missing</p>
            <p className={styles.emptyBody}>
              Set REACT_APP_ADN_BASE_URL, REACT_APP_DOMAIN_ID and REACT_APP_ENV_ID to load assets.
            </p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No matches</p>
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
              className={styles.lightboxClose}
              onClick={() => setActiveAsset(null)}
              aria-label="Close"
            >
              &times;
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
