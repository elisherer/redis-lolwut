/*
 * Copyright (c) 2019, Salvatore Sanfilippo <antirez at gmail dot com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   * Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   * Neither the name of Redis nor the names of its contributors may be used
 *     to endorse or promote products derived from this software without
 *     specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * ----------------------------------------------------------------------------
 *
 * This file implements the LOLWUT command. The command should do something
 * fun and interesting, and should be replaced by a new implementation at
 * each new version of Redis.
 *
 * Thanks to Michele Hiki Falcone for the original image that ispired
 * the image, part of his game, Plaguemon.
 *
 * Thanks to the Shhh computer art collective for the help in tuning the
 * output to have a better artistic effect.
 */

const { lwCreateCanvas, lwDrawPixel, lwFreeCanvas, lwGetPixel } = require('./lolwut');

const rand = () => Math.floor(Math.random() * 32767); // mimic C rand

/**
 * Render the canvas using the four gray levels of the standard color
 * terminal: they match very well to the grayscale display of the gameboy.
 *
 * @param canvas {lwCanvas}
 * @returns {string}
 */
function renderCanvas(canvas) {
  let text = '';
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let color = lwGetPixel(canvas,x,y);
      let ce; /* Color escape sequence. */

      /* Note that we set both the foreground and background color.
       * This way we are able to get a more consistent result among
       * different terminals implementations. */
      switch(color) {
        case 0: ce = "0;30;40m"; break;    /* Black */
        case 1: ce = "0;90;100m"; break;   /* Gray 1 */
        case 2: ce = "0;37;47m"; break;    /* Gray 2 */
        case 3: ce = "0;97;107m"; break;   /* White */
        default: ce = "0;30;40m"; break;   /* Just for safety. */
      }
      text += `\x1b[${ce} \x1b[0m`;
    }
    if (y !== canvas.height-1) text += "\n";
  }
  return text;
}

/* Draw a skyscraper on the canvas, according to the parameters in the
 * 'skyscraper' structure. Window colors are random and are always one
 * of the two grays. */
class Skyscraper {
  constructor() {
    this.xoff = 0;        /* X offset. */
    this.width = 0;       /* Pixels width. */
    this.height = 0;      /* Pixels height. */
    this.windows = 0;     /* Draw windows if true. */
    this.color = 0;       /* Color of the skyscraper. */
  }
}

/**
 *
 * @param canvas {lwCanvas}
 * @param si {Skyscraper}
 */
function generateSkyscraper(canvas, si) {
  const starty = canvas.height-1;
  const endy = starty - si.height + 1;
  for (let y = starty; y >= endy; y--) {
    for (let x = si.xoff; x < si.xoff+si.width; x++) {
      /* The roof is four pixels less wide. */
      if (y === endy && (x <= si.xoff+1 || x >= si.xoff+si.width-2))
      continue;
      let color = si.color;
      /* Alter the color if this is a place where we want to
       * draw a window. We check that we are in the inner part of the
       * skyscraper, so that windows are far from the borders. */
      if (si.windows &&
        x > si.xoff+1 &&
      x < si.xoff+si.width-2 &&
      y > endy+1 &&
      y < starty-1)
      {
        /* Calculate the x,y position relative to the start of
         * the window area. */
        const relx = x - (si.xoff+1);
        const rely = y - (endy+1);

        /* Note that we want the windows to be two pixels wide
         * but just one pixel tall, because terminal "pixels"
         * (characters) are not square. */
        if ((Math.floor(relx/2) % 2) && (rely % 2)) {
          do {
            color = 1 + rand() % 2;
          } while (color === si.color);
          /* Except we want adjacent pixels creating the same
           * window to be the same color. */
          if (relx % 2) color = lwGetPixel(canvas,x-1,y);
        }
      }
      lwDrawPixel(canvas,x,y,color);
    }
  }
}

/* Generate a skyline inspired by the parallax backgrounds of 8 bit games. */
function generateSkyline(canvas) {
  const si = new Skyscraper();

  /* First draw the background skyscraper without windows, using the
   * two different grays. We use two passes to make sure that the lighter
   * ones are always in the background. */
  for (let color = 2; color >= 1; color--) {
    si.color = color;
    for (let offset = -10; offset < canvas.width;) {
      offset += rand() % 8;
      si.xoff = offset;
      si.width = 10 + rand()%9;
      if (color === 2)
        si.height = Math.floor(canvas.height/2) + Math.floor(rand()%canvas.height/2);
      else
        si.height = Math.floor(canvas.height/2) + Math.floor(rand()%canvas.height/3);
      si.windows = 0;
      generateSkyscraper(canvas, si);
      if (color === 2)
        offset += Math.floor(si.width/2);
      else
        offset += si.width+1;
    }
  }

  /* Now draw the foreground skyscraper with the windows. */
  si.color = 0;
  for (let offset = -10; offset < canvas.width;) {
    offset += rand() % 8;
    si.xoff = offset;
    si.width = 5 + rand()%14;
    if (si.width % 4) si.width += (si.width % 3);
    si.height = Math.floor(canvas.height/3) + Math.floor(rand()%canvas.height/2);
    si.windows = 1;
    generateSkyscraper(canvas, si);
    offset += si.width+5;
  }
}

/* The LOLWUT 6 command:
 *
 * LOLWUT [columns] [rows]
 *
 * By default the command uses 80 columns, 40 squares per row
 * per column.
 */
function lolwut6Command(cols = 80, rows = 20) {

  /* Limits. We want LOLWUT to be always reasonably fast and cheap to execute
   * so we have maximum number of columns, rows, and output resulution. */
  if (cols < 1) cols = 1;
  if (cols > 1000) cols = 1000;
  if (rows < 1) rows = 1;
  if (rows > 1000) rows = 1000;

  /* Generate the city skyline and reply. */
  const canvas = lwCreateCanvas(cols,rows,3);
  generateSkyline(canvas);
  console.log(renderCanvas(canvas));
  console.log(
    "Dedicated to the 8 bit game developers of past and present.\n" +
  "Original 8 bit image from Plaguemon by hikikomori. Redis ver. 6.0.0");
  lwFreeCanvas(canvas);
}

module.exports = lolwut6Command;