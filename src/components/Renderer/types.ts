import type {vec3} from 'gl-matrix';

import type {point3} from './Ray';

export type color = vec3;

export const enum ObjectType {
  SPHERE = 'SPHERE',
}

export const enum MaterialType {
  SMOOTH,
  METAL,
  DIELECTRIC,
}

export type MetalMaterial = {
  type: MaterialType.METAL;
  color: color;
  fuzz: number;
};

export type SmoothMaterial = {
  type: MaterialType.SMOOTH;
  color: color;
};

export type DielectricMaterial = {
  type: MaterialType.DIELECTRIC;
  color: color;
  refractionIndex: number;
};

export type Material = SmoothMaterial | MetalMaterial | DielectricMaterial;

export type SphereObject = {
  type: ObjectType.SPHERE;
  center: point3;
  radius: number;
  material: Material;
};

export type SceneObject = SphereObject;

export type Scene = {
  objects: SceneObject[];
};

export type Hit = {
  t: number;
  point: point3;
  normal: vec3;
  isFrontFace: boolean;
  material: Material;
};
