/**
 * @fileoverview Utility functions shared within the Genotet. This file also
 * extends a few common/library prototypes.
 */

'use strict';

var Utils = {
  /** @const {number} */
  PIXEL_TOLERANCE: .1,
  /** @const {number} */
  RANGE_TOLERANCE: .001,

  /**
   * Vector type of arbitrary length.
   * @typedef {!Array<number>} Vector
   */
  Vector: null,

  /**
   * Vector type of length 2.
   * @typedef {!Array<number>} Vector2
   */
  Vector2: null,

  /**
   * Gets the sign of a number.
   * @param {number} x The number to be signed.
   * @return {number} 1 if x is positive, -1 if x is negative,
   *     and 0 if x is zero.
   */
  sign: function(x) {
    if (x == 0) {
      return 0;
    }
    return x > 0 ? 1 : -1;
  },

  /**
   * Checks whether two ranges intersect.
   * @param {!Array<number>} range1 The first range.
   * @param {!Array<number>} range2 The second range.
   */
  rangeIntersect: function(range1, range2) {
    return range1[0] < range2[1] - this.RANGE_TOLERANCE &&
        range1[1] > range2[0] + this.RANGE_TOLERANCE;
  },

  /**
   * Checks whether two 2D rectangles intersect.
   * @param {{x: number, y: number, w: number, h: number}} rect1
   *     Definition of the first rectangle.
   * @param {{x: number, y: number, w: number, h: number}} rect2
   *     Definition of the second rectangle.
   * @return {boolean} Whether the two rectangles intersect.
   */
  rectIntersect: function(rect1, rect2) {
    var xMin = Math.max(rect1.x, rect2.x);
    var xMax = Math.min(rect1.x + rect1.w, rect2.x + rect2.w);
    var yMin = Math.max(rect1.y, rect2.y);
    var yMax = Math.min(rect1.y + rect1.h, rect2.y + rect2.h);
    return xMin < xMax - this.PIXEL_TOLERANCE &&
        yMin < yMax - this.PIXEL_TOLERANCE;
  },

  /**
   * Checks whether a rectangle is inside the screen window.
   * @param {{x: number, y: number, w: number, h: number}} rect
   *     Definition of the rectangle.
   * @return {boolean} Whether the rectangle is inside the screen window.
   */
  rectInsideWindow: function(rect) {
    return rect.x >= -this.PIXEL_TOLERANCE &&
        rect.x + rect.w <= $(window).width() + this.PIXEL_TOLERANCE &&
        rect.y >= -this.PIXEL_TOLERANCE &&
        rect.y + rect.h <= $(window).height() + this.PIXEL_TOLERANCE;
  },

  /**
   * Combines translate and scale into a CSS transform string.
   * @param {Vector2=} opt_translate Zoom translate.
   * @param {number=} opt_scale Zoom scale.
   * @param {number=} opt_rotate Rotation degree.
   * @return {string} CSS string of the transform.
   */
  getTransform: function(opt_translate, opt_scale, opt_rotate) {
    var result = '';
    if (opt_translate != null) {
      result += 'translate(' + opt_translate + ')';
    }
    if (opt_scale != null) {
      result += 'scale(' + opt_scale + ')';
    }
    if (opt_rotate != null) {
      result += 'rotate(' + opt_rotate + ')';
    }
    return result;
  },

  /**
   * Gets the middle point of two 2D points.
   * @param {Vector2} p1 Point 1.
   * @param {Vector2} p2 Point 2.
   * @return {Vector2} The middle point.
   */
  middlePoint: function(p1, p2) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  },

  /**
   * Gets the mirrored point of p, with respect to the line (lp1, lp2).
   * The distance of the mirrored point will be k times of the distance
   * from p to (lp1, lp2).
   * @param {Vector2} p Point to be mirrored.
   * @param {Vector2} lp1 Point on the line.
   * @param {Vector2} lp2 Another point on the line.
   * @return {Vector2} Mirrored point.
   */
  mirrorPoint: function(p, lp1, lp2, opt_k) {
    var lineVector = this.normalizeVector(this.subtractVector(lp2, lp1));
    var projectedOffset = this.dotVector(
        this.subtractVector(p, lp1), lineVector);
    var d = this.multiplyVector(lineVector, projectedOffset);
    var m = this.addVector(lp1, d);
    var offset = this.subtractVector(m, p);
    return this.addVector(m, offset);
  },

  /**
   * Gets the dot product of two 2D vectors.
   * @param {Vector2} p1 Vector 1.
   * @param {Vector2} p2 Vector 2.
   * @return {number} The dot product.
   */
  dotVector: function(p1, p2) {
    return p1[0] * p2[0] + p1[1] * p2[1];
  },

  /**
   * Rotates a vector by 90 degrees counter-clockwise.
   * @param {Vector2} p Input vector.
   */
  perpendicularVector: function(p) {
    return [p[1], -p[0]];
  },

  /**
   * Normalize a vector.
   * @param {Vector2} p
   */
  normalizeVector: function(p) {
    var len = this.vectorLength(p);
    return this.multiplyVector(p, 1 / len);
  },

  /**
   * Gets the length of a vector.
   * @param {Vector2} p Input vector.
   */
  vectorLength: function(p) {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
  },

  /**
   * Compute the distance between two 2D points
   * @param {Vector2} p1 Point 1.
   * @param {Vector2} p2 Point 2.
   */
  vectorDistance: function(p1, p2) {
    return this.vectorLength(this.subtractVector(p1, p2));
  },
  /**
   * Adds two 2D vectors.
   * @param {Vector2} p1 Vector 1.
   * @param {Vector2} p2 Vector 2.
   */
  addVector: function(p1, p2) {
    return [p1[0] + p2[0], p1[1] + p2[1]];
  },
  /**
   * Subtracts a 2D vector from another.
   * @param {Vector2} p1 Vector 1.
   * @param {Vector2} p2 Vector 2.
   */
  subtractVector: function(p1, p2) {
    return [p1[0] - p2[0], p1[1] - p2[1]];
  },
  /**
   * Multiply a 2D vector by a constant.
   * @param {Vector2} p Input vector.
   * @param {number} k Input constant.
   */
  multiplyVector: function(p, k) {
    return [p[0] * k, p[1] * k];
  },

  /**
   * Gets a random color from D3.
   * @return {string} Random color.
   */
  randomColor: function(seed) {
    var colors = d3.scale.category20().range();
    var index  = Math.floor(Math.random() * colors.length);
    return colors[index];
  }

  /*
  parse: function(key, value) {
    var type;
    if (value && typeof value === 'object') {
      type = value.type;
      if (typeof type === 'string' && typeof window[type] === 'function') {
        return new (window[type])(value);
      }
    }
    return value;
  },

  tagString: function(str, tag, style, cls) {
    if (style == null) style = '';
    else style = ' style="' + style + '" ';
    if (cls == null) cls = '';
    else cls = ' class="' + cls + '" ';
    return '<'+ tag + cls + style + '>'+ str + '</'+ tag + '>';
  },

  xor: function(a, b) {
    return a ? !b : b;
  },

  compare: function(a, b) {
    var va = a[this.attr], vb = b[this.attr];
    if (va < vb) return -1 * this.order;
    else if (va == vb) return 0;
    else return 1 * this.order;
  },

  stableSort: function(a, attr, order) {
    if (order == null) this.order = 1;
    else this.order = order;
    this.attr = attr;
    this.stableSortExec(a, 0, a.length - 1);
  },

  stableSortExec: function(a, l, r) { // a must be an array
    if (r <= l) return;
    var m = Math.floor((l + r) / 2);
    this.stableSortExec(a, l, m);
    this.stableSortExec(a, m + 1, r);
    var b = new Array(), i = l, j = m + 1;
    while (i <= m && j <= r) {
      if (this.compare(a[i], a[j]) <= 0) { b.push(a[i]); i++; }
      else { b.push(a[j]); j++; }
    }
    while (i <= m) { b.push(a[i]); i++; }
    while (j <= r) { b.push(a[j]); j++; }
    for (var i = l; i <= r; i++) a[i] = b[i - l];
  },

  intersectRanges: function(a1, b1, a2, b2) {
    return a2 < b1 && b2 > a1;
  },

  encodeSpecialChar: function(exp) {
    exp = exp.replace(/\+/g, '%2B');
    exp = exp.replace(/\?/g, '%3F');
    return exp;
  }
  */
};

/**
 * Swaps the elements at index i and j in an array.
 * @param {number} i Element index.
 * @param {number} j Element index.
 * @returns {!Array<number>}
 */
Array.prototype.swap = function(i, j) {
  var tmp = this[i];
  this[i] = this[j];
  this[j] = tmp;
  return this;
};