export type RenderOptions = {
  diffThreshold: number;
  avgMixer: number;
  highlightDiff: boolean;
  width: number;
  height: number;
  zoom: number;
  gamma: number;
  maxDepth: number;
  useTrueLambertian: boolean;
  diffuseRaysProbes: number;
  diffuseSecondRaysProbes: number;
};

export const defaultConfig: Omit<RenderOptions, 'width' | 'height'> = {
  avgMixer: 0.45,
  diffThreshold: 0.25,
  highlightDiff: false,
  zoom: 1,
  gamma: 1,
  maxDepth: 10,
  useTrueLambertian: false,
  diffuseRaysProbes: 10,
  diffuseSecondRaysProbes: 1,
};
