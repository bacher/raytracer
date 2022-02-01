import {vec3} from 'gl-matrix';

import type {point3, Ray} from './Ray';
import {pointAtRay} from './Ray';

export type RenderOptions = {
  diffThreshold: number;
  avgMixer: number;
  highlightDiff: boolean;
  width: number;
  height: number;
  zoom: number;
};

export const defaultConfig: Omit<RenderOptions, 'width' | 'height'> = {
  avgMixer: 0.45,
  diffThreshold: 0.25,
  highlightDiff: false,
  zoom: 1,
};

type color = vec3;

function getSquaredLength(vec: vec3): number {
  return vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2;
}

type Hit = {
  t: number;
  point: point3;
  normal: vec3;
  isFrontFace: boolean;
};

function getSphereHit(
  {center, radius}: SphereObject,
  ray: Ray,
  min: number,
  max: number,
): Hit | undefined {
  const oc = vec3.sub(vec3.create(), ray.origin, center);
  const a = getSquaredLength(ray.dir);
  const b = vec3.dot(oc, ray.dir);
  const c = getSquaredLength(oc) - radius ** 2;
  const discriminant = b ** 2 - a * c;

  if (discriminant < 0) {
    return undefined;
  }

  const sqrtD = Math.sqrt(discriminant);

  let root = (-b - sqrtD) / a;

  if (root < min || max < root) {
    root = (-b + sqrtD) / a;

    if (root < min || max < root) {
      return undefined;
    }
  }

  const hitPoint = pointAtRay(ray, root);

  const normal = vec3.create();
  vec3.sub(normal, hitPoint, center);
  vec3.scale(normal, normal, 1 / radius);

  const isFrontFace = vec3.dot(ray.dir, normal) < 0;
  if (!isFrontFace) {
    vec3.scale(normal, normal, -1);
  }

  return {
    t: root,
    point: hitPoint,
    normal,
    isFrontFace,
  };
}

enum ObjectType {
  SPHERE = 'SPHERE',
}

type SphereObject = {
  type: ObjectType.SPHERE;
  center: point3;
  radius: number;
};

type SceneObject = SphereObject;

type Scene = {
  objects: SceneObject[];
};

function getColorFromScene(
  scene: Scene,
  ray: Ray,
  min: number,
  max: number,
): color {
  let nearestHit: Hit | undefined;

  for (const obj of scene.objects) {
    switch (obj.type) {
      case ObjectType.SPHERE:
        const hit = getSphereHit(
          obj,
          ray,
          min,
          nearestHit ? nearestHit.t : max,
        );

        if (hit) {
          nearestHit = hit;
        }
        break;
    }
  }

  if (nearestHit) {
    const color = vec3.create();
    vec3.add(color, nearestHit.normal, vec3.fromValues(1, 1, 1));
    vec3.scale(color, color, 0.5);
    return color;
  }

  const unitDirection = vec3.normalize(vec3.create(), ray.dir);
  const tt = 0.5 * (unitDirection[1] + 1);

  return vec3.add(
    vec3.create(),
    vec3.scale(vec3.create(), vec3.fromValues(1, 1, 1), 1 - tt),
    vec3.scale(vec3.create(), vec3.fromValues(0.5, 0.7, 1), tt),
  );
}

function getColorDiff(color1: color, color2: color): number {
  return (
    Math.abs(color1[0] - color2[0]) +
    Math.abs(color1[1] - color2[1]) +
    Math.abs(color1[2] - color2[2])
  );
}

export function render(
  imageData: ImageData,
  {avgMixer, diffThreshold, highlightDiff}: RenderOptions,
) {
  const {width, height, data} = imageData;

  console.log(`render at ${width}x${height}`);

  let all = 0;
  let overDiff = 0;

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

  function writePixel(color: Readonly<vec3>, offset: number): void {
    const ir = Math.floor(255.999 * color[0]);
    const ig = Math.floor(255.999 * color[1]);
    const ib = Math.floor(255.999 * color[2]);
    data.set([ir, ig, ib, 255], offset);
  }

  function getColorAt(offset: number): color {
    const pixelData = data.slice(offset, offset + 4);
    return [pixelData[0] / 256, pixelData[1] / 256, pixelData[2] / 256];
  }

  const aspectRatio = width / height;

  const viewportHeight = 2.0;
  const viewportWidth = aspectRatio * viewportHeight;
  const focalLength = 1.0;

  const origin = vec3.fromValues(0, 0, 0);
  const horizontal = vec3.fromValues(viewportWidth, 0, 0);
  const vertical = vec3.fromValues(0, viewportHeight, 0);

  const lowerLeftCorner = vec3.subtract(
    vec3.create(),
    origin,
    vec3.fromValues(viewportWidth / 2, viewportHeight / 2, focalLength),
  );

  function getColorByXy(x: number, y: number) {
    const u = x / width;
    const v = 1 - y / height;

    const dir = vec3.create();
    vec3.add(dir, lowerLeftCorner, vec3.scale(vec3.create(), horizontal, u));
    vec3.add(dir, dir, vec3.scale(vec3.create(), vertical, v));
    vec3.sub(dir, dir, origin);

    const r = {
      origin,
      dir,
    };

    return getColorFromScene(scene, r, 0, Infinity);
  }

  const fillRedPixels: {x: number; y: number}[] = [];

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const avgColor = getColorByXy(x + 0.5, y + 0.5);
      let sumDiff = 0;

      if (y > 0) {
        const upColor = getColorAt(((y - 1) * width + x + 1) * 4);
        sumDiff += getColorDiff(avgColor, upColor);
      }

      if (x > 0) {
        const leftColor = getColorAt((y * width + x - 1) * 4);
        sumDiff += getColorDiff(avgColor, leftColor);
      }

      let color1: color;
      let color2: color;
      let color3: color;
      let color4: color;

      if (sumDiff > diffThreshold) {
        overDiff++;
        color1 = getColorByXy(x, y);
        color2 = getColorByXy(x + 1, y);
        color3 = getColorByXy(x, y + 1);
        color4 = getColorByXy(x + 1, y + 1);

        const avgColor = vec3.create();
        vec3.add(avgColor, avgColor, color1);
        vec3.add(avgColor, avgColor, color2);
        vec3.add(avgColor, avgColor, color3);
        vec3.add(avgColor, avgColor, color4);
        vec3.scale(avgColor, avgColor, 0.25);

        vec3.lerp(color1, color1, avgColor, avgMixer);
        vec3.lerp(color2, color2, avgColor, avgMixer);
        vec3.lerp(color3, color3, avgColor, avgMixer);
        vec3.lerp(color4, color4, avgColor, avgMixer);

        if (highlightDiff) {
          fillRedPixels.push({x: x, y: y});
        }
      } else {
        color1 = avgColor;
        color2 = avgColor;
        color3 = avgColor;
        color4 = avgColor;
      }

      all++;

      writePixel(color1, (y * width + x) * 4);
      writePixel(color2, (y * width + x + 1) * 4);
      writePixel(color3, ((y + 1) * width + x) * 4);
      writePixel(color4, ((y + 1) * width + x + 1) * 4);
    }
  }

  for (const {x, y} of fillRedPixels) {
    const red = [1, 0, 0] as const;
    writePixel(red, (y * width + x) * 4);
    writePixel(red, (y * width + x + 1) * 4);
    writePixel(red, ((y + 1) * width + x) * 4);
    writePixel(red, ((y + 1) * width + x + 1) * 4);
  }

  console.log('all =', all);
  console.log(
    'overDiff =',
    overDiff,
    `ratio = ${((overDiff * 100) / all).toFixed(4)}%`,
  );
}