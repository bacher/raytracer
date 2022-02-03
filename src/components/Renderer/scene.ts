import {vec3} from 'gl-matrix';

import {MaterialType, ObjectType, Scene} from './types';

export const scene: Scene = {
  objects: [
    {
      type: ObjectType.SPHERE,
      center: vec3.fromValues(0, -100.6, -1.0),
      radius: 100,
      material: {
        type: MaterialType.SMOOTH,
        color: [0.8, 0.8, 0.0],
      },
    },
    {
      type: ObjectType.SPHERE,
      center: vec3.fromValues(0.0, -0.1, -1.0),
      radius: 0.5,
      material: {
        type: MaterialType.SMOOTH,
        color: [0.7, 0.3, 0.3],
      },
    },
    {
      type: ObjectType.SPHERE,
      center: vec3.fromValues(-1.0, -0.1, -1.3),
      radius: 0.5,
      material: {
        // type: MaterialType.METAL,
        // color: [0.8, 0.8, 0.8],
        // fuzz: 0.3,
        type: MaterialType.DIELECTRIC,
        color: [1, 1, 1],
        refractionIndex: 1.5,
      },
    },
    {
      type: ObjectType.SPHERE,
      center: vec3.fromValues(-1.0, -0.1, -1.3),
      radius: -0.4,
      material: {
        type: MaterialType.DIELECTRIC,
        color: [1, 1, 1],
        refractionIndex: 1.5,
      },
    },
    {
      type: ObjectType.SPHERE,
      center: vec3.fromValues(1.0, -0.1, -1.0),
      radius: 0.5,
      material: {
        type: MaterialType.METAL,
        color: [0.8, 0.6, 0.2],
        fuzz: 1,
        // type: MaterialType.DIELECTRIC,
        // color: [1, 1, 1],
        // refractionIndex: 1.5,
      },
    },
  ],
};

/*
  const scene: Scene = {
    objects: [
      {
        type: ObjectType.SPHERE,
        center: vec3.fromValues(0, 0, -1),
        radius: 0.5,
      },
      {
        type: ObjectType.SPHERE,
        center: vec3.fromValues(0, -100.5, -1),
        radius: 100,
      },
    ],
  };
   */
