import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox, usePlane } from "@react-three/cannon";
import { OrbitControls } from "@react-three/drei";

function Track() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }));

  return (
    <group>
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[1000, 10]} />
        <meshStandardMaterial color="darkgray" />
      </mesh>
      {/* Road lines */}
      {Array.from({ length: 50 }, (_, i) => (
        <mesh key={`center-${i}`} position={[i * 20 - 500, 0.01, 0]}>
          <planeGeometry args={[10, 0.2]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {Array.from({ length: 50 }, (_, i) => (
        <mesh key={`left-${i}`} position={[i * 20 - 500, 0.01, 2]}>
          <planeGeometry args={[10, 0.2]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      ))}
      {Array.from({ length: 50 }, (_, i) => (
        <mesh key={`right-${i}`} position={[i * 20 - 500, 0.01, -2]}>
          <planeGeometry args={[10, 0.2]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      ))}
      {/* City buildings */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`building-left-${i}`} position={[-10, 8, i * 50 - 500]}>
          <boxGeometry args={[4, 16, 4]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={`building-right-${i}`} position={[10, 8, i * 50 - 500]}>
          <boxGeometry args={[4, 16, 4]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
      {/* Trees or lamps */}
      {Array.from({ length: 40 }, (_, i) => (
        <mesh key={`tree-${i}`} position={[i % 2 === 0 ? -12 : 12, 3, i * 25 - 500]}>
          <cylinderGeometry args={[0.5, 0.5, 6]} />
          <meshStandardMaterial color="darkgreen" />
        </mesh>
      ))}
    </group>
  );
}

function Car({ position, color, isPlayer }: { position: [number, number, number]; color: string; isPlayer: boolean }, ref: React.Ref<any>) {
  const [meshRef, api] = useBox(() => ({ mass: 1, position, args: [1, 0.5, 2] }));

  // Forward the ref to the mesh
  React.useImperativeHandle(ref, () => meshRef.current);

  const velocity = useRef([0, 0, 0]);
  const keys = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    if (!isPlayer) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key down:', event.code);
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      console.log('Key up:', event.code);
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlayer]);

  useFrame(() => {
    if (isPlayer) {
      let vx = 0, vz = 0;
      if (keys.current.forward) vz -= 1;
      if (keys.current.backward) vz += 1;
      if (keys.current.left) vx -= 1;
      if (keys.current.right) vx += 1;
      api.velocity.set(vx, 0, vz);

      // Infinite track: loop back
      if (meshRef.current && meshRef.current.position.z < -500) {
        api.position.set(meshRef.current.position.x, 1, 500);
      }
    } else {
      // Simple AI: move forward
      api.velocity.set(0, 0, -0.5);
      if (meshRef.current && meshRef.current.position.z < -500) {
        api.position.set(meshRef.current.position.x, 1, 500);
      }
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[1, 0.5, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

const CarWithRef = React.forwardRef(Car);

function FollowCamera({ target }: { target: React.RefObject<any> }) {
  const { camera } = useThree();

  useFrame(() => {
    if (target.current) {
      const carPos = target.current.position;
      camera.position.set(carPos.x + 3, carPos.y + 10, carPos.z + 8);
      camera.lookAt(carPos.x, carPos.y, carPos.z - 3);
    }
  });

  return null;
}

export default function Scene() {
  const playerRef = useRef<any>();

  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }} tabIndex={0} onPointerDown={() => {}}>
      <ambientLight intensity={0.3} />
      <directionalLight castShadow position={[-10, 20, -10]} intensity={1} />
      <Physics>
        <Track />
        <CarWithRef ref={playerRef} position={[0, 1, 0]} color="red" isPlayer={true} />
        <CarWithRef position={[2, 1, 0]} color="blue" isPlayer={false} />
        <CarWithRef position={[-2, 1, 0]} color="green" isPlayer={false} />
      </Physics>
      <FollowCamera target={playerRef} />
    </Canvas>
  );
}