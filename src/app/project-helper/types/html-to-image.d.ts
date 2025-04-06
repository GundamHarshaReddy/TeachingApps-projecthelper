declare module 'html-to-image' {
  interface Options {
    quality?: number;
    backgroundColor?: string;
  }

  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
} 