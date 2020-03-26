/*
 * Copyright (c) 2018, Salvatore Sanfilippo <antirez at gmail dot com>
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
 */

const { lwCanvas } = require('./lolwut.h');

/* ========================== LOLWUT Canvase ===============================
 * Many LOWUT versions will likely print some computer art to the screen.
 * This is the case with LOLWUT 5 and LOLWUT 6, so here there is a generic
 * canvas implementation that can be reused.  */

/**
 * Allocate and return a new canvas of the specified size.
 * @param width {Number} int
 * @param height {Number} int
 * @param bgcolor {Number} int
 * @returns {lwCanvas}
 */
function lwCreateCanvas(width, height, bgcolor) {
  const canvas = new lwCanvas();
  canvas.width = width;
  canvas.height = height;
  canvas.pixels = Array.from({ length: width*height })
    .map(() => bgcolor);
  return canvas;
}
module.exports.lwCreateCanvas = lwCreateCanvas;

/**
 * Free the canvas created by lwCreateCanvas().
 * @param canvas {lwCanvas}
 */
function lwFreeCanvas(canvas) {
  canvas.pixels = null;
}
module.exports.lwFreeCanvas = lwFreeCanvas;

/**
 * Set a pixel to the specified color. Color is 0 or 1, where zero means no
 * dot will be displyed, and 1 means dot will be displayed.
 * Coordinates are arranged so that left-top corner is 0,0. You can write
 * out of the size of the canvas without issues.
 * @param canvas {lwCanvas}
 * @param x {Number} int
 * @param y {Number} int
 * @param color {Number} int
 */
function lwDrawPixel(canvas, x, y, color) {
  if (x < 0 || x >= canvas.width ||
  y < 0 || y >= canvas.height) return;
  canvas.pixels[x+y*canvas.width] = color;
}
module.exports.lwDrawPixel = lwDrawPixel;

/**
 * Return the value of the specified pixel on the canvas.
 * @param canvas {lwCanvas}
 * @param x {Number} int
 * @param y {Number} int
 * @returns {Number} int
 */
function lwGetPixel(canvas, x, y) {
  if (x < 0 || x >= canvas.width ||
  y < 0 || y >= canvas.height) return 0;
  return canvas.pixels[x+y*canvas.width];
}
module.exports.lwGetPixel = lwGetPixel;

/**
 * Draw a line from x1,y1 to x2,y2 using the Bresenham algorithm.
 * @param canvas {lwCanvas}
 * @param x1 {Number} int
 * @param y1 {Number} int
 * @param x2 {Number} int
 * @param y2 {Number} int
 * @param color {Number} int
 */
function lwDrawLine(canvas, x1, y1, x2, y2, color) {
  let dx = Math.abs(x2-x1);
  let dy = Math.abs(y2-y1);
  let sx = (x1 < x2) ? 1 : -1;
  let sy = (y1 < y2) ? 1 : -1;
  let err = dx-dy, e2;

  while(1) {
    lwDrawPixel(canvas,x1,y1,color);
    if (x1 === x2 && y1 === y2) break;
    e2 = err*2;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }
}
module.exports.lwDrawLine = lwDrawLine;

/**
 * Draw a square centered at the specified x,y coordinates, with the specified
 * rotation angle and size. In order to write a rotated square, we use the
 * trivial fact that the parametric equation:
 *
 *  x = sin(k)
 *  y = cos(k)
 *
 * Describes a circle for values going from 0 to 2*PI. So basically if we start
 * at 45 degrees, that is k = PI/4, with the first point, and then we find
 * the other three points incrementing K by PI/2 (90 degrees), we'll have the
 * points of the square. In order to rotate the square, we just start with
 * k = PI/4 + rotation_angle, and we are done.
 *
 * Of course the vanilla equations above will describe the square inside a
 * circle of radius 1, so in order to draw larger squares we'll have to
 * multiply the obtained coordinates, and then translate them. However this
 * is much simpler than implementing the abstract concept of 2D shape and then
 * performing the rotation/translation transformation, so for LOLWUT it's
 * a good approach.
 *
 * @param canvas {lwCanvas}
 * @param x {Number} int
 * @param y {Number} int
 * @param size {Number} float
 * @param angle {Number} float
 * @param color {Number} int
 */
function lwDrawSquare(canvas, x, y, size, angle, color) {
  let px = new Int32Array(4), py = new Int32Array(4);

  /* Adjust the desired size according to the fact that the square inscribed
   * into a circle of radius 1 has the side of length SQRT(2). This way
   * size becomes a simple multiplication factor we can use with our
   * coordinates to magnify them. */
  size /= 1.4142135623;
  size = Math.round(size);

  /* Compute the four points. */
  let k = Math.PI/4 + angle;
  for (let j = 0; j < 4; j++) {
    px[j] = Math.round(Math.sin(k) * size + x);
    py[j] = Math.round(Math.cos(k) * size + y);
    k += Math.PI/2;
  }

  /* Draw the square. */
  for (let j = 0; j < 4; j++)
  lwDrawLine(canvas,px[j],py[j],px[(j+1)%4],py[(j+1)%4],color);
}
module.exports.lwDrawSquare = lwDrawSquare;