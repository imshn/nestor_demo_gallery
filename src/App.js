import React, { useState } from 'react'
import styles from './App.module.css'
import Assets from './Assets.json'

const ADN_BASE_URL = process.env.REACT_APP_ADN_BASE_URL || '';
const DOMAIN_ID = process.env.REACT_APP_DOMAIN_ID || '';
const ENV_ID = process.env.REACT_APP_ENV_ID || '';

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState(ADN_BASE_URL)
  const filteredAssets = Assets.filter(asset => 
    asset.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.targetPlatform.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderAsset = (asset) => {
    const assetUrl = `${selectedService}${DOMAIN_ID}/${asset.assetId}/${ENV_ID}/${asset.targetPlatform}`;
    // console.log(assetUrl)
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
      <div>
        <select className={styles.serviceSelector} value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
          <option value="" disabled>Select a service</option>
          <option value="https://adn.nestortech.io/api/va/">ADN v1</option>
          <option value="https://adn-v2-delta.vercel.app/api/va/">ADN delta v2</option>
        </select>
      </div>
      
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