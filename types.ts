export type TreeMode = 'tree' | 'scattered';

export interface BlessingState {
  text: string;
  loading: boolean;
  error: string | null;
}

export interface DualPosData {
  id: number;
  treePos: [number, number, number];
  scatterPos: [number, number, number];
  treeScale: number;
  color?: string;
  rotationSpeed?: number;
}

export type OrnamentType = 'box' | 'sphere' | 'star';

export interface InstanceData {
  id: number;
  type: OrnamentType;
  treePos: [number, number, number];
  scatterPos: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  weight: number; // 0.1 (light) to 1.0 (heavy)
}
