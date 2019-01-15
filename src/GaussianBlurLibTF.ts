import { Tensor, Tensor1D, Tensor2D, Tensor3D, tensor1d, tensor2d, fromPixels } from "@tensorflow/tfjs";

export class GaussianBlur {
  private KERNEL: Tensor = tensor2d(
    [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
    [3, 3]
  );
  private static instance: GaussianBlur;
  private imageTensor: Tensor3D;
  private channels = {
    red: 0,
    green: 1,
    blue: 2,
    alpha: 3
  };
  private width: number;
  private height: number;

  private constructor() {}

  public static getInstance(): GaussianBlur {
    if (!this.instance) {
      this.instance = new GaussianBlur();
    }
    return this.instance;
  }

  public getBluredImageData(imgData: ImageData) {
    this.setGeneratedImageTensor(imgData);
    this.setExtractedDimensions(imgData);
    const red = new Uint8ClampedArray(this.getPixels("red").dataSync());
    const green = new Uint8ClampedArray(this.getPixels("green").dataSync());
    const blue = new Uint8ClampedArray(this.getPixels("blue").dataSync());
    const rgba = this.blur(red, green, blue);
    return new ImageData(rgba, this.width, this.height);
  }

  private blur(
    red: Uint8ClampedArray,
    green: Uint8ClampedArray,
    blue: Uint8ClampedArray
  ) {
    let rgba = [];
    for (let i = 0; i < red.length; i++) {
      rgba.push(this.applyConvolution(this.extractThreeByThreeRegion(red, i)));
      rgba.push(
        this.applyConvolution(this.extractThreeByThreeRegion(green, i))
      );
      rgba.push(this.applyConvolution(this.extractThreeByThreeRegion(blue, i)));
      rgba.push(255);
    }
    return new Uint8ClampedArray(rgba);
  }

  private setGeneratedImageTensor(imgData: ImageData) {
    this.imageTensor = fromPixels(imgData);
  }

  private setExtractedDimensions(imgData: ImageData) {
    this.width = imgData.width;
    this.height = imgData.height;
  }

  private getPixels(channel: string): Tensor1D {
    return this.imageTensor
      .gather(tensor1d([this.channels[channel]], "int32"), 2)
      .reshape([this.width * this.height]);
  }

  private extractThreeByThreeRegion(
    pixels: Uint8ClampedArray,
    pixelIndex: number
  ) {
    const width = this.width;
    return tensor2d(
      [
        [
          pixels[pixelIndex - width - 1] || 0,
          pixels[pixelIndex - width] || 0,
          pixels[pixelIndex - width + 1] || 0
        ],
        [
          pixels[pixelIndex - 1] || 0,
          pixels[pixelIndex],
          pixels[pixelIndex + 1] || 0
        ],
        [
          pixels[pixelIndex + width - 1] || 0,
          pixels[pixelIndex + width] || 0,
          pixels[pixelIndex + width + 1] || 0
        ]
      ],
      [3, 3]
    );
  }

  private applyConvolution(region: Tensor2D): number {
    return region
      .mul(this.KERNEL)
      .sum()
      .div(this.KERNEL.sum())
      .dataSync()[0];
  }
}
