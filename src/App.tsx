import React from "react";
import Scene from "./Scene";
import SortingVisualizer from "./SortingVisulizer";

export default function App() {
  return (
    <div className="w-screen h-screen">
      <Scene />
      {/* If you prefer the original SortingVisualizer, it's still present at src/SortingVisulizer.jsx */}
    </div>
  );
}
