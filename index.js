import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [track, setTrack] = useState(null);
  const [bgColor, setBgColor] = useState("#1e1e1e");
  const [startTime, setStartTime] = useState(null);

  const fetchTrack = async () => {
    try {
      const res = await fetch(
        "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=ping_pingado&api_key=3b623213c2ffd94b270a98d31d8de8a2&format=json&limit=1"
      );
      const data = await res.json();
      const recentTrack = data.recenttracks.track[0];

      if (recentTrack["@attr"] && recentTrack["@attr"].nowplaying === "true") {
        setTrack(recentTrack);
        setStartTime(Date.now());
        getDominantColor(recentTrack.image[3]["#text"]);
      } else {
        setTrack(null);
      }
    } catch (error) {
      console.error("Erro ao buscar a música:", error);
    }
  };

  const getDominantColor = (imgUrl) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4 * 100) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      setBgColor(`rgb(${r}, ${g}, ${b})`);
    };
  };

  useEffect(() => {
    fetchTrack();
    const interval = setInterval(fetchTrack, 5000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = () => {
    if (!startTime) return "0:00";
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container" style={{ backgroundColor: bgColor }}>
      {track ? (
        <div className="card">
          <img src={track.image[3]["#text"]} alt="album" className="album-cover" />
          <div className="info">
            <div className="title">{track.name}</div>
            <div className="artist">{track.artist["#text"]}</div>
            <div className="album">{track.album["#text"]}</div>
            <div className="time">{getElapsedTime()}</div>
          </div>
        </div>
      ) : (
        <div className="loading">A carregar...</div>
      )}
    </div>
  );
}

export default App;
