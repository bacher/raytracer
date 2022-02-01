import {CSSProperties, useEffect, useRef} from 'react';
import {GUI} from 'dat.gui';

import {useForceUpdate} from '../../hooks/useForceUpdate';
import {defaultConfig, render, RenderOptions} from './render';

import styles from './Renderer.module.css';

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
    const o = optionsRef.current;

    gui.add(o, 'avgMixer', 0, 1, 0.01).onChange(update);
    gui.add(o, 'diffThreshold', 0, 3, 0.01).onChange(update);
    gui.add(o, 'highlightDiff').onChange(update);
    gui.add(o, 'zoom', 0.5, 100, 0.5).onChange(update);
    gui.add(o, 'maxDepth', 0, 50, 1).onChange(update);
    gui.add(o, 'diffuseRaysProbes', 0, 100, 1).onChange(update);
    gui.add(o, 'diffuseSecondRaysProbes', 0, 20, 1).onChange(update);

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

    const width = Math.floor(WIDTH / 2 / zoom) * 2;
    const height = Math.floor(HEIGHT / 2 / zoom) * 2;

    if (canvas.width !== width) {
      console.log(`reset canvas width to ${width}x${height}`);
      canvas.width = width;
      canvas.height = height;
      canvas.style.setProperty('--zoom', zoom.toString());
      canvas.classList.toggle('zoom', zoom !== 1);
    }

    const imageData = ctx.createImageData(width, height);
    console.time('renderTime');
    render(imageData, optionsRef.current);
    console.timeEnd('renderTime');
    ctx.putImageData(imageData, 0, 0);
  });

  return (
    <div
      className={styles.wrapper}
      style={
        {
          '--width': `${WIDTH}px`,
          '--height': `${HEIGHT}px`,
        } as CSSProperties
      }
    >
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
