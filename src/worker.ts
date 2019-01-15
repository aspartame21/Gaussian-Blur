import { GaussianBlur } from "./GaussianBlurLibTF";

declare function postMessage(message: any, transfer?: any[]): void;

self.addEventListener("message", e => {
  const imageData = e.data.imageData;
  const blur = GaussianBlur.getInstance();
  postMessage(blur.getBluredImageData(imageData))
});
