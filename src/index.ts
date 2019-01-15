const files = document.querySelector("#files");
const img = document.createElement("img");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const worker = new Worker("./worker.ts");

files.addEventListener("change", e => {
  const file = (e.target as HTMLInputElement).files[0];
  const imgSrc = URL.createObjectURL(file);
  img.src = imgSrc;
  img.onload = () => {
    document.body.appendChild(img);

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    worker.postMessage({
      imageData: ctx.getImageData(0, 0, canvas.width, canvas.height)
    });
    // document.body.appendChild(canvas);
  };
});

worker.onmessage = e => {
  document.body.appendChild(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(e.data as ImageData, 0, 0);
};
