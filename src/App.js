import React, { useState } from 'react'
import styles from './App.module.css'
import Assets from './Assets.json'

const ADN_BASE_URL = process.env.REACT_APP_ADN_BASE_URL || '';
const DOMAIN_ID = process.env.REACT_APP_DOMAIN_ID || '';
const ENV_ID = process.env.REACT_APP_ENV_ID || '';

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssets = Assets.filter(asset => 
    asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.targetPlatform.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderAsset = (asset) => {
    const assetUrl = `${ADN_BASE_URL}${DOMAIN_ID}/${asset.assetId}/${ENV_ID}/${asset.targetPlatform}`;
    
    if (asset.isVideo) {
      return (
        <video className={styles.video} controls>
          <source src={assetUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <img
          src={assetUrl}
          alt={asset.assetId}
          className={styles.image}
        />
      );
    }
  };

  const renderGallery = () => {
    if (!ADN_BASE_URL || !DOMAIN_ID || !ENV_ID) {
      return <p>Error: Missing environment variables</p>;
    }

    return filteredAssets.map((asset, index) => (
      <div className={styles.assetContainer} key={index}>
        {renderAsset(asset)}
        <p className={styles.assetId}>{asset.assetId}</p>
        <div className={styles.description}>
          Target Platform: {asset.targetPlatform}
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Nestor Asset Demo</h1>
      <p className={styles.dynamicText}>[{ENV_ID}]</p>
      
      <div className={styles.searchContainer}>
        <input
          type="search"
          placeholder="Search assets..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.gallery}>
        {renderGallery()}
      </div>
    </div>
  )
}

