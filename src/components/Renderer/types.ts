import type {vec3} from 'gl-matrix';

import type {point3} from './Ray';

export type color = vec3;

export const enum ObjectType {
  SPHERE = 'SPHERE',
}

export const enum MaterialType {
  SMOOTH,
  METAL,
}

export type Material = {
  type: MaterialType;
  color: color;
};

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
