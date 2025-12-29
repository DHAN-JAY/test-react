import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, useBox, usePlane } from "@react-three/cannon";
import { OrbitControls, Plane } from "@react-three/drei";

function RotatingPlane() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }));

  return (
    <Plane
      ref={ref as any}
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

function Box({ position = [0, 5, 0], mass = 1, color = "orange" }: any) {
  const [rotation, setRotation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [ref, api] = useBox(() => ({ mass: isDragging ? 0 : mass, position }));

  useFrame(() => {
    if (rotation && ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.x += 0.01;
      ref.current.rotation.z += 0.01;
    }
  });

  const handlePointerDown = (event: any) => {
    setIsDragging(true);
  };

  const handlePointerMove = (event: any) => {
    if (!isDragging) return;
    const intersect = event.intersections?.find((i: any) => i.object.name === "rotating_plane");
    if (intersect) {
      api.position.set(intersect.point.x, intersect.point.y + 0.5, intersect.point.z);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <mesh
      ref={ref as any}
      castShadow
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas shadows camera={{ position: [5, 5, 8], fov: 50 }} className="absolute inset-0">
      <ambientLight intensity={0.3} />
      <directionalLight castShadow position={[-10, 20, -10]} intensity={1} />
      <Physics>
        <RotatingPlane />
        <Box />
        <Box position={[1, 0, 0]} mass={2} color="green" />
        <Box position={[1, 1, 0]} mass={2} color="blue" />
        <Box position={[1, 0, 1]} mass={3} color="red" />
        <Box position={[2, 0, 0]} mass={3} color="yellow" />
      </Physics>
      <OrbitControls />
    </Canvas>
  );
}
