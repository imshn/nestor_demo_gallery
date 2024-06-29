/* eslint-disable no-undef */
import { useEffect } from "react";

import "./App.css";

const DOMAIN_ID = process.env.REACT_APP_DOMAIN_ID;
const ENV_ID = process.env.REACT_APP_ENV_ID;
console.log(import.meta.env);
const imagesUrls = [
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/car/" +
    ENV_ID +
    "/android",
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/air001/" +
    ENV_ID +
    "/web",
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/flower001/" +
    ENV_ID +
    "/generic",
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/house001/" +
    ENV_ID +
    "/ios",
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/mobile001/" +
    ENV_ID +
    "/android",
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/earth001/" +
    ENV_ID +
    "/web",
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/animal001/" +
    ENV_ID +
    "/android",
  "https://adn.nestortech.io/api/va/" +
    DOMAIN_ID +
    "/ship001/" +
    ENV_ID +
    "/web"
];
export default function App() {
  const renderImage = () => {
    return imagesUrls?.map((url, index) => (
      <div key={index}>
        <img src={url} />
      </div>
    ));
  };

  useEffect(() => {
    renderImage();
  }, [imagesUrls]);
  return (
    <>
      <h2 style={{ margin: "30px 20px" }}>
        Nestor Assets Demo
        <br />
        <p class="h6">[{ENV_ID}]</p>
      </h2>
      <div className="container text-center">
        <h1 style={{ margin: "30px 20px" }}>Asset Gallery</h1>
        <div className="gallery">{renderImage()}</div>
      </div>
    </>
  );
}
