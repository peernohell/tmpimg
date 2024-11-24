import * as PImage from 'pureimage/dist/index.js';


class Writer extends EventTarget {
  constructor(writer) {
    super();
    this.writer = writer;
  }
  emit(event, data) {
    this.dispatchEvent(new Event(event));

    // TODO only on pipe
    if (event === 'pipe') {
      data.on('data', this.onData.bind(this));
      data.on('end', this.onEnd.bind(this));
    }
  }
  onData(chunk) {
    this.writer.write(chunk, 'binary');
  }
  onEnd() {
    console.log('writer.close');
    this.emit('finish');
    this.writer.close();
  }
  end() { /* needed but writer.close must be called later. */ }
  on(evt, cb) { this.addEventListener(evt, cb); return this; }
  removeListener(evt, cb) { this.removeEventListener(evt, cb); }
  prependListener(evt, cb) { this.addEventListener(evt, cb); }
}

async function handleRequest(request, env, writable) {
  const img = PImage.make(200, 200);
  const ctx = img.getContext('2d');

  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.strokeStyle = "blue";
  ctx.arc(100,100,50,1.7*Math.PI,0.7*Math.PI);
  ctx.stroke();

  return await PImage.encodePNGToStream(img, new Writer(writable.getWriter()));
}

export default {
  async fetch(request, env) {
    console.log('fetch ...');
    try {
      let { readable, writable } = new TransformStream();
      await handleRequest(request, env, writable);

      var myHeaders = new Headers();

      myHeaders.append('Content-Type', 'image/png');
      return new Response(readable, { headers: myHeaders });
    } catch (e) {
      return new Response(e.message + '<br><pre>' + e.stack + '</pre>');
    }
} }
