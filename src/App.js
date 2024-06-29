/* eslint-disable no-undef */
import { useEffect } from "react";
import Assets from "./Assets.json";
import "./App.css";

const DOMAIN_ID = process.env.REACT_APP_DOMAIN_ID;
const ENV_ID = process.env.REACT_APP_ENV_ID;
const ADN_BASE_URL = process.env.REACT_APP_ADN_BASE_URL;

export default function App() {
  const renderImage = () => {
    return Assets.map((asset, index) => (
      <div key={index}>
        <img
          src={`${ADN_BASE_URL}${DOMAIN_ID}/${asset.assetId}/${ENV_ID}/${asset.targetPlatform}`}
          alt=""
        />
        <p className="h6">{asset.assetId}</p>
      </div>
    ));
  };

  useEffect(() => {
    renderImage();
  }, []);
  return (
    <>
      <h2 style={{ margin: "30px 20px" }}>
        Nestor Assets Demo
        <br />
        <p className="h6">[{ENV_ID}]</p>
      </h2>
      <div className="container text-center">
        <h1 style={{ margin: "30px 20px" }}>Asset Gallery</h1>
        <div className="gallery">{renderImage()}</div>
      </div>
    </>
  );
}
