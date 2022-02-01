import {useEffect, useRef} from 'react';
import {GUI} from 'dat.gui';

import {useForceUpdate} from '../../hooks/useForceUpdate';
import {defaultConfig, render, RenderOptions} from './render';

const WIDTH = 800;
const HEIGHT = 600;

export function Renderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const optionsRef = useRef<RenderOptions>({
    ...defaultConfig,
    width: WIDTH,
    height: HEIGHT,
  });

  const update = useForceUpdate();

  useEffect(() => {
    const gui = new GUI({name: 'Renderer'});
    gui.add(optionsRef.current, 'avgMixer', 0, 1, 0.01).onChange(update);
    gui.add(optionsRef.current, 'diffThreshold', 0, 2, 0.01).onChange(update);
    gui.add(optionsRef.current, 'highlightDiff').onChange(update);
    gui.add(optionsRef.current, 'zoom', 0.5, 100, 0.5).onChange(update);
    return () => {
      gui.destroy();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      throw new Error();
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error();
    }

    const {zoom} = optionsRef.current;

    const width = Math.floor(WIDTH/2 / zoom)*2;
    const height = Math.floor(HEIGHT/2/zoom)*2;

    if (canvas.width !== width) {
      console.log(`reset canvas width to ${width}x${height}`);
      canvas.width = width;
      canvas.height = height;
      canvas.style.setProperty('--zoom', zoom.toString())
      canvas.classList.toggle('zoom', zoom !==1);
    }

    const imageData = ctx.createImageData(width, height);
    console.time('render');
    render(imageData, optionsRef.current);
    console.timeEnd('render');
    ctx.putImageData(imageData, 0, 0);
  });

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />;
}
