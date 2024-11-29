import * as PImage from 'pureimage/dist/index.js';
import fontRobotoBuffer from './Roboto-Regular.ttf';
import opentype from 'opentype.js';


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
  // load font
  const piFont = PImage.registerFont('','Roboto');
  const otFont = await opentype.parse(fontRobotoBuffer); 
  piFont.font = otFont;
  piFont.loaded = true;


  // generate canvas
  const img = PImage.make(200, 50);
  const ctx = img.getContext('2d');

  ctx.beginPath();
  ctx.fillStyle = "#E0E0E0";
  ctx.fillRect(0, 0, 200, 50);

  ctx.fillStyle = '#1C1C1C';
  ctx.font = "24px Roboto";
  // ctx.font = "60pt source";
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('hello world', 100, 25);

  // render cavas to png stream and write to response
  await PImage.encodePNGToStream(img, new Writer(writable.getWriter()));
  return;
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
