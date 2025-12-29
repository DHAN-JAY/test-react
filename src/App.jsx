import React, { useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox, usePlane,  } from "@react-three/cannon";
import { OrbitControls, Plane } from "@react-three/drei";
import SortingVisualizer from "./SortingVisulizer";

// function Plane() {
//   const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0] }));
//   return (
//     <mesh ref={ref} receiveShadow>
//       <planeGeometry args={[100, 100]} />
//       <meshStandardMaterial color="lightGreen" />
//     </mesh>
//   );
// }

function RotatingPlane() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Initial rotation to lay flat,
    position: [0,0,0],
    args: [10,10]
  }));

  return (
    <Plane
      ref={ref}
      name="rotating_plane"
      args={[10, 15]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial color="lightGreen" />
    </Plane>
  );
}


function Box({
  position =  [0,5,0],
  mass = 1,
  color = "orange",
}) {
  const [rotation, setRotation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [ref, api] = useBox(() => ({ mass: isDragging ? 0 : mass, position: position }));

  useFrame(() => {
    if(rotation){
      ref.current.geometry.rotateY(0.01);
      ref.current.geometry.rotateX(0.01);
      ref.current.geometry.rotateZ(0.01);
    }
  })

  const onPointerOver = () => {
    setRotation(true);
  }

  const onPointerOut = () => {
    setRotation(false);
  }

  const handlePointerDown = (event) => {
    setIsDragging(true);

    // Lock drag plane to the intersection point
    // const intersect = event.intersections[0];
    // if (intersect) {
    //   setDragPlane(intersect.point);
    // }
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    // Move the box based on the intersection with the ground plane
    const intersect = event.intersections.find((i) => i.object.name === "rotating_plane");
    if (intersect) {
      api.position.set(intersect.point.x, intersect.point.y + 0.5, intersect.point.z);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const onClick = () => {
    api.applyImpulse([0,20,0], [0,0,0]);
  }
  
  return (
    <mesh 
      ref={ref} 
      castShadow
      // onClick={onClick}
      // onPointerOver={onPointerOver}
      // onPointerOut={onPointerOut}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh"}}>
    {/* <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
      {/* Add Sunlight (DirectionalLight) 
      <directionalLight
        castShadow
        position={[-10, 20, -10]} // Position of the sunlight
        intensity={1} // Brightness of the light
        shadow-mapSize={[1024, 1024]} // Shadow quality
      />
      <ambientLight intensity={0.2} /> {/* Soft ambient light 
      <Physics>
        <RotatingPlane />
        <Box />
        <Box position={[1,0,0]} mass={2} color="green"/>
        <Box position={[1,1,0]} mass={2} color="blue" />
        <Box position={[1,0,1]} mass={3} color="red" />
        <Box position={[2,0,0]} mass={3} color="yellow" />
        <Box position={[2,0,1]} mass={1.2} color="lightBlue" />
      </Physics>
      <OrbitControls />
    </Canvas> */}
    <SortingVisualizer />
    </div>
  );
}

export default App;
