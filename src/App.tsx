import React, { useRef, useEffect, useState } from "react";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentGradient, setCurrentGradient] = useState<string[]>([
    "rgb(0, 0, 0)",
    "rgb(0, 0, 0)",
    "rgb(0, 0, 0)",
    "rgb(0, 0, 0)",
  ]);
  const [targetGradient, setTargetGradient] = useState<string[]>([
    "rgb(0, 0, 0)",
    "rgb(0, 0, 0)",
    "rgb(0, 0, 0)",
    "rgb(0, 0, 0)",
  ]);

  const interpolateColor = (start: string, end: string, factor: number) => {
    const [r1, g1, b1] = start.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r2, g2, b2] = end.match(/\d+/g)?.map(Number) || [0, 0, 0];

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const extractColors = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const video = videoRef.current;
    if (!video) return;
    if (video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const getQuadrantColor = (
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const imageData = context.getImageData(x, y, width, height).data;
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      return `rgb(${r}, ${g}, ${b})`;
    };

    const quadrantWidth = Math.floor(canvas.width / 2);
    const quadrantHeight = Math.floor(canvas.height / 2);

    const topLeftColor = getQuadrantColor(0, 0, quadrantWidth, quadrantHeight);
    const topRightColor = getQuadrantColor(
      quadrantWidth,
      0,
      quadrantWidth,
      quadrantHeight
    );
    const bottomLeftColor = getQuadrantColor(
      0,
      quadrantHeight,
      quadrantWidth,
      quadrantHeight
    );
    const bottomRightColor = getQuadrantColor(
      quadrantWidth,
      quadrantHeight,
      quadrantWidth,
      quadrantHeight
    );

    setTargetGradient([
      topLeftColor,
      topRightColor,
      bottomRightColor,
      bottomLeftColor,
    ]);
  };

  useEffect(() => {
    const intervalId = setInterval(extractColors, 1000 / 30); // 30 FPS

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const transition = (progress: number) => {
      const newGradient = currentGradient.map((color, index) =>
        interpolateColor(color, targetGradient[index], progress)
      );

      setCurrentGradient(newGradient);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(() =>
          transition(progress + 0.02)
        );
      }
    };

    transition(0);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetGradient]);

  const gradient = `linear-gradient(to bottom right, ${currentGradient.join(
    ", "
  )})`;

  return (
    <div className="flex items-center align-center justify-center min-h-screen">
      <div
        className="relative flex items-center justify-center "
        style={{
          width: "880px",
          height: "495px",
          position: "relative",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: gradient,
            filter: "blur(90px)",
            transition: "background 0.1s ease, filter 0.1s ease",
            zIndex: 1,
            opacity: 0.7,
          }}
        ></div>

        <div className="relative z-10 flex items-center justify-center w-full max-w-4xl p-4 ">
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <video
            ref={videoRef}
            controls
            autoPlay
            loop
            className="relative rounded-md shadow-lg w-[880px] h-[495px]"
            style={{
              objectFit: "cover",
            }}
          >
            <source src="/videos/sample2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default App;
