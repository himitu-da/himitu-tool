declare module "utif" {
  export interface Ifd {
    width: number;
    height: number;
  }

  export function decode(buffer: ArrayBuffer): Ifd[];
  export function decodeImages(buffer: ArrayBuffer, ifds: Ifd[]): void;
  export function toRGBA8(ifd: Ifd): Uint8Array;
}
