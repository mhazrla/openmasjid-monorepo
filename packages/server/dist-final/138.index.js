"use strict";
exports.id = 138;
exports.ids = [138];
exports.modules = {

/***/ 47702:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const WritableStream = (__webpack_require__(57075).Writable)
const inherits = (__webpack_require__(57975).inherits)

const StreamSearch = __webpack_require__(18752)

const PartStream = __webpack_require__(4908)
const HeaderParser = __webpack_require__(20215)

const DASH = 45
const B_ONEDASH = Buffer.from('-')
const B_CRLF = Buffer.from('\r\n')
const EMPTY_FN = function () {}

function Dicer (cfg) {
  if (!(this instanceof Dicer)) { return new Dicer(cfg) }
  WritableStream.call(this, cfg)

  if (!cfg || (!cfg.headerFirst && typeof cfg.boundary !== 'string')) { throw new TypeError('Boundary required') }

  if (typeof cfg.boundary === 'string') { this.setBoundary(cfg.boundary) } else { this._bparser = undefined }

  this._headerFirst = cfg.headerFirst

  this._dashes = 0
  this._parts = 0
  this._finished = false
  this._realFinish = false
  this._isPreamble = true
  this._justMatched = false
  this._firstWrite = true
  this._inHeader = true
  this._part = undefined
  this._cb = undefined
  this._ignoreData = false
  this._partOpts = { highWaterMark: cfg.partHwm }
  this._pause = false

  const self = this
  this._hparser = new HeaderParser(cfg)
  this._hparser.on('header', function (header) {
    self._inHeader = false
    self._part.emit('header', header)
  })
}
inherits(Dicer, WritableStream)

Dicer.prototype.emit = function (ev) {
  if (ev === 'finish' && !this._realFinish) {
    if (!this._finished) {
      const self = this
      process.nextTick(function () {
        self.emit('error', new Error('Unexpected end of multipart data'))
        if (self._part && !self._ignoreData) {
          const type = (self._isPreamble ? 'Preamble' : 'Part')
          self._part.emit('error', new Error(type + ' terminated early due to unexpected end of multipart data'))
          self._part.push(null)
          process.nextTick(function () {
            self._realFinish = true
            self.emit('finish')
            self._realFinish = false
          })
          return
        }
        self._realFinish = true
        self.emit('finish')
        self._realFinish = false
      })
    }
  } else { WritableStream.prototype.emit.apply(this, arguments) }
}

Dicer.prototype._write = function (data, encoding, cb) {
  // ignore unexpected data (e.g. extra trailer data after finished)
  if (!this._hparser && !this._bparser) { return cb() }

  if (this._headerFirst && this._isPreamble) {
    if (!this._part) {
      this._part = new PartStream(this._partOpts)
      if (this.listenerCount('preamble') !== 0) { this.emit('preamble', this._part) } else { this._ignore() }
    }
    const r = this._hparser.push(data)
    if (!this._inHeader && r !== undefined && r < data.length) { data = data.slice(r) } else { return cb() }
  }

  // allows for "easier" testing
  if (this._firstWrite) {
    this._bparser.push(B_CRLF)
    this._firstWrite = false
  }

  this._bparser.push(data)

  if (this._pause) { this._cb = cb } else { cb() }
}

Dicer.prototype.reset = function () {
  this._part = undefined
  this._bparser = undefined
  this._hparser = undefined
}

Dicer.prototype.setBoundary = function (boundary) {
  const self = this
  this._bparser = new StreamSearch('\r\n--' + boundary)
  this._bparser.on('info', function (isMatch, data, start, end) {
    self._oninfo(isMatch, data, start, end)
  })
}

Dicer.prototype._ignore = function () {
  if (this._part && !this._ignoreData) {
    this._ignoreData = true
    this._part.on('error', EMPTY_FN)
    // we must perform some kind of read on the stream even though we are
    // ignoring the data, otherwise node's Readable stream will not emit 'end'
    // after pushing null to the stream
    this._part.resume()
  }
}

Dicer.prototype._oninfo = function (isMatch, data, start, end) {
  let buf; const self = this; let i = 0; let r; let shouldWriteMore = true

  if (!this._part && this._justMatched && data) {
    while (this._dashes < 2 && (start + i) < end) {
      if (data[start + i] === DASH) {
        ++i
        ++this._dashes
      } else {
        if (this._dashes) { buf = B_ONEDASH }
        this._dashes = 0
        break
      }
    }
    if (this._dashes === 2) {
      if ((start + i) < end && this.listenerCount('trailer') !== 0) { this.emit('trailer', data.slice(start + i, end)) }
      this.reset()
      this._finished = true
      // no more parts will be added
      if (self._parts === 0) {
        self._realFinish = true
        self.emit('finish')
        self._realFinish = false
      }
    }
    if (this._dashes) { return }
  }
  if (this._justMatched) { this._justMatched = false }
  if (!this._part) {
    this._part = new PartStream(this._partOpts)
    this._part._read = function (n) {
      self._unpause()
    }
    if (this._isPreamble && this.listenerCount('preamble') !== 0) {
      this.emit('preamble', this._part)
    } else if (this._isPreamble !== true && this.listenerCount('part') !== 0) {
      this.emit('part', this._part)
    } else {
      this._ignore()
    }
    if (!this._isPreamble) { this._inHeader = true }
  }
  if (data && start < end && !this._ignoreData) {
    if (this._isPreamble || !this._inHeader) {
      if (buf) { shouldWriteMore = this._part.push(buf) }
      shouldWriteMore = this._part.push(data.slice(start, end))
      if (!shouldWriteMore) { this._pause = true }
    } else if (!this._isPreamble && this._inHeader) {
      if (buf) { this._hparser.push(buf) }
      r = this._hparser.push(data.slice(start, end))
      if (!this._inHeader && r !== undefined && r < end) { this._oninfo(false, data, start + r, end) }
    }
  }
  if (isMatch) {
    this._hparser.reset()
    if (this._isPreamble) { this._isPreamble = false } else {
      if (start !== end) {
        ++this._parts
        this._part.on('end', function () {
          if (--self._parts === 0) {
            if (self._finished) {
              self._realFinish = true
              self.emit('finish')
              self._realFinish = false
            } else {
              self._unpause()
            }
          }
        })
      }
    }
    this._part.push(null)
    this._part = undefined
    this._ignoreData = false
    this._justMatched = true
    this._dashes = 0
  }
}

Dicer.prototype._unpause = function () {
  if (!this._pause) { return }

  this._pause = false
  if (this._cb) {
    const cb = this._cb
    this._cb = undefined
    cb()
  }
}

module.exports = Dicer


/***/ }),

/***/ 20215:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const EventEmitter = (__webpack_require__(78474).EventEmitter)
const inherits = (__webpack_require__(57975).inherits)
const getLimit = __webpack_require__(96305)

const StreamSearch = __webpack_require__(18752)

const B_DCRLF = Buffer.from('\r\n\r\n')
const RE_CRLF = /\r\n/g
const RE_HDR = /^([^:]+):[ \t]?([\x00-\xFF]+)?$/ // eslint-disable-line no-control-regex

function HeaderParser (cfg) {
  EventEmitter.call(this)

  cfg = cfg || {}
  const self = this
  this.nread = 0
  this.maxed = false
  this.npairs = 0
  this.maxHeaderPairs = getLimit(cfg, 'maxHeaderPairs', 2000)
  this.maxHeaderSize = getLimit(cfg, 'maxHeaderSize', 80 * 1024)
  this.buffer = ''
  this.header = {}
  this.finished = false
  this.ss = new StreamSearch(B_DCRLF)
  this.ss.on('info', function (isMatch, data, start, end) {
    if (data && !self.maxed) {
      if (self.nread + end - start >= self.maxHeaderSize) {
        end = self.maxHeaderSize - self.nread + start
        self.nread = self.maxHeaderSize
        self.maxed = true
      } else { self.nread += (end - start) }

      self.buffer += data.toString('binary', start, end)
    }
    if (isMatch) { self._finish() }
  })
}
inherits(HeaderParser, EventEmitter)

HeaderParser.prototype.push = function (data) {
  const r = this.ss.push(data)
  if (this.finished) { return r }
}

HeaderParser.prototype.reset = function () {
  this.finished = false
  this.buffer = ''
  this.header = {}
  this.ss.reset()
}

HeaderParser.prototype._finish = function () {
  if (this.buffer) { this._parseHeader() }
  this.ss.matches = this.ss.maxMatches
  const header = this.header
  this.header = {}
  this.buffer = ''
  this.finished = true
  this.nread = this.npairs = 0
  this.maxed = false
  this.emit('header', header)
}

HeaderParser.prototype._parseHeader = function () {
  if (this.npairs === this.maxHeaderPairs) { return }

  const lines = this.buffer.split(RE_CRLF)
  const len = lines.length
  let m, h

  for (var i = 0; i < len; ++i) { // eslint-disable-line no-var
    if (lines[i].length === 0) { continue }
    if (lines[i][0] === '\t' || lines[i][0] === ' ') {
      // folded header content
      // RFC2822 says to just remove the CRLF and not the whitespace following
      // it, so we follow the RFC and include the leading whitespace ...
      if (h) {
        this.header[h][this.header[h].length - 1] += lines[i]
        continue
      }
    }

    const posColon = lines[i].indexOf(':')
    if (
      posColon === -1 ||
      posColon === 0
    ) {
      return
    }
    m = RE_HDR.exec(lines[i])
    h = m[1].toLowerCase()
    this.header[h] = this.header[h] || []
    this.header[h].push((m[2] || ''))
    if (++this.npairs === this.maxHeaderPairs) { break }
  }
}

module.exports = HeaderParser


/***/ }),

/***/ 4908:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const inherits = (__webpack_require__(57975).inherits)
const ReadableStream = (__webpack_require__(57075).Readable)

function PartStream (opts) {
  ReadableStream.call(this, opts)
}
inherits(PartStream, ReadableStream)

PartStream.prototype._read = function (n) {}

module.exports = PartStream


/***/ }),

/***/ 18752:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/**
 * Copyright Brian White. All rights reserved.
 *
 * @see https://github.com/mscdex/streamsearch
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * Based heavily on the Streaming Boyer-Moore-Horspool C++ implementation
 * by Hongli Lai at: https://github.com/FooBarWidget/boyer-moore-horspool
 */

const { EventEmitter } = __webpack_require__(78474)
const { inherits } = __webpack_require__(57975)

function SBMH (needle) {
  if (typeof needle === 'string') {
    needle = Buffer.from(needle)
  }

  if (!Buffer.isBuffer(needle)) {
    throw new TypeError('The needle has to be a String or a Buffer.')
  }

  const needleLength = needle.length
  const needleLastCharIndex = needleLength - 1

  if (needleLength === 0) {
    throw new Error('The needle cannot be an empty String/Buffer.')
  }

  if (needleLength > 256) {
    throw new Error('The needle cannot have a length bigger than 256.')
  }

  this.maxMatches = Infinity
  this.matches = 0

  this._occ = new Uint8Array(256)
    .fill(needleLength) // Initialize occurrence table.
  this._lookbehind_size = 0
  this._needle = needle
  this._bufpos = 0

  this._lookbehind = Buffer.alloc(needleLastCharIndex)

  // Populate occurrence table with analysis of the needle,
  // ignoring last letter.
  for (var i = 0; i < needleLastCharIndex; ++i) { // eslint-disable-line no-var
    this._occ[needle[i]] = needleLastCharIndex - i
  }
}
inherits(SBMH, EventEmitter)

SBMH.prototype.reset = function () {
  this._lookbehind_size = 0
  this.matches = 0
  this._bufpos = 0
}

SBMH.prototype.push = function (chunk, pos) {
  if (!Buffer.isBuffer(chunk)) {
    chunk = Buffer.from(chunk, 'binary')
  }
  const chlen = chunk.length
  this._bufpos = pos || 0
  let r
  while (r !== chlen && this.matches < this.maxMatches) { r = this._sbmh_feed(chunk) }
  return r
}

SBMH.prototype._sbmh_feed = function (data) {
  const len = data.length
  const needle = this._needle
  const needleLength = needle.length
  const needleLastCharIndex = needleLength - 1
  const needleLastChar = needle[needleLastCharIndex]

  // Positive: points to a position in `data`
  //           pos == 3 points to data[3]
  // Negative: points to a position in the lookbehind buffer
  //           pos == -2 points to lookbehind[lookbehind_size - 2]
  let pos = -this._lookbehind_size
  let ch

  if (pos < 0) {
    // Lookbehind buffer is not empty. Perform Boyer-Moore-Horspool
    // search with character lookup code that considers both the
    // lookbehind buffer and the current round's haystack data.
    //
    // Loop until
    //   there is a match.
    // or until
    //   we've moved past the position that requires the
    //   lookbehind buffer. In this case we switch to the
    //   optimized loop.
    // or until
    //   the character to look at lies outside the haystack.
    while (pos < 0 && pos <= len - needleLength) {
      ch = data[pos + needleLastCharIndex]

      if (
        ch === needleLastChar &&
        this._sbmh_memcmp(data, pos, needleLastCharIndex)
      ) {
        this._lookbehind_size = 0
        ++this.matches
        this.emit('info', true)
        return (this._bufpos = pos + needleLength)
      }

      pos += this._occ[ch]
    }

    // No match.

    while (pos < 0 && !this._sbmh_memcmp(data, pos, len - pos)) {
      // There's too few data for Boyer-Moore-Horspool to run,
      // so let's use a different algorithm to skip as much as
      // we can.
      // Forward pos until
      //   the trailing part of lookbehind + data
      //   looks like the beginning of the needle
      // or until
      //   pos == 0
      ++pos
    }

    if (pos >= 0) {
      // Discard lookbehind buffer.
      this.emit('info', false, this._lookbehind, 0, this._lookbehind_size)
      this._lookbehind_size = 0
    } else {
      // Cut off part of the lookbehind buffer that has
      // been processed and append the entire haystack
      // into it.
      const bytesToCutOff = this._lookbehind_size + pos
      if (bytesToCutOff > 0) {
        // The cut off data is guaranteed not to contain the needle.
        this.emit('info', false, this._lookbehind, 0, bytesToCutOff)
      }

      this._lookbehind_size -= bytesToCutOff
      this._lookbehind.copy(this._lookbehind, 0, bytesToCutOff, this._lookbehind_size)

      data.copy(this._lookbehind, this._lookbehind_size)
      this._lookbehind_size += len

      this._bufpos = len
      return len
    }
  }

  // Lookbehind buffer is now empty. We only need to check if the
  // needle is in the haystack.
  pos = data.indexOf(needle, pos + this._bufpos)

  if (pos !== -1) {
    ++this.matches
    if (pos === 0) { this.emit('info', true) } else { this.emit('info', true, data, this._bufpos, pos) }
    return (this._bufpos = pos + needleLength)
  }

  pos = len - needleLastCharIndex
  if (pos < 0) {
    pos = 0
  }

  // There was no match. If there's trailing haystack data that we cannot
  // match yet using the Boyer-Moore-Horspool algorithm (because the trailing
  // data is less than the needle size) then match using a modified
  // algorithm that starts matching from the beginning instead of the end.
  // Whatever trailing data is left after running this algorithm is added to
  // the lookbehind buffer.
  while (
    pos !== len &&
    (
      data[pos] !== needle[0] ||
      Buffer.compare(
        data.subarray(pos + 1, len),
        needle.subarray(1, len - pos)
      ) !== 0
    )
  ) {
    ++pos
  }

  if (pos !== len) {
    data.copy(this._lookbehind, 0, pos, len)
    this._lookbehind_size = len - pos
  }

  // Everything until pos is guaranteed not to contain needle data.
  if (pos !== 0) { this.emit('info', false, data, this._bufpos, pos) }

  this._bufpos = len
  return len
}

SBMH.prototype._sbmh_lookup_char = function (data, pos) {
  return pos < 0
    ? this._lookbehind[this._lookbehind_size + pos]
    : data[pos]
}

SBMH.prototype._sbmh_memcmp = function (data, pos, len) {
  for (var i = 0; i < len; ++i) { // eslint-disable-line no-var
    if (this._sbmh_lookup_char(data, pos + i) !== this._needle[i]) { return false }
  }
  return true
}

module.exports = SBMH


/***/ }),

/***/ 98149:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const WritableStream = (__webpack_require__(57075).Writable)
const { inherits } = __webpack_require__(57975)
const Dicer = __webpack_require__(47702)

const MultipartParser = __webpack_require__(29584)
const UrlencodedParser = __webpack_require__(29596)
const parseParams = __webpack_require__(42521)

function Busboy (opts) {
  if (!(this instanceof Busboy)) { return new Busboy(opts) }

  if (typeof opts !== 'object') {
    throw new TypeError('Busboy expected an options-Object.')
  }
  if (typeof opts.headers !== 'object') {
    throw new TypeError('Busboy expected an options-Object with headers-attribute.')
  }
  if (typeof opts.headers['content-type'] !== 'string') {
    throw new TypeError('Missing Content-Type-header.')
  }

  const {
    headers,
    ...streamOptions
  } = opts

  this.opts = {
    autoDestroy: false,
    ...streamOptions
  }
  WritableStream.call(this, this.opts)

  this._done = false
  this._parser = this.getParserByHeaders(headers)
  this._finished = false
}
inherits(Busboy, WritableStream)

Busboy.prototype.emit = function (ev) {
  if (ev === 'finish') {
    if (!this._done) {
      this._parser?.end()
      return
    } else if (this._finished) {
      return
    }
    this._finished = true
  }
  WritableStream.prototype.emit.apply(this, arguments)
}

Busboy.prototype.getParserByHeaders = function (headers) {
  const parsed = parseParams(headers['content-type'])

  const cfg = {
    defCharset: this.opts.defCharset,
    fileHwm: this.opts.fileHwm,
    headers,
    highWaterMark: this.opts.highWaterMark,
    isPartAFile: this.opts.isPartAFile,
    limits: this.opts.limits,
    parsedConType: parsed,
    preservePath: this.opts.preservePath
  }

  if (MultipartParser.detect.test(parsed[0])) {
    return new MultipartParser(this, cfg)
  }
  if (UrlencodedParser.detect.test(parsed[0])) {
    return new UrlencodedParser(this, cfg)
  }
  throw new Error('Unsupported Content-Type.')
}

Busboy.prototype._write = function (chunk, encoding, cb) {
  this._parser.write(chunk, cb)
}

module.exports = Busboy
module.exports["default"] = Busboy
module.exports.Busboy = Busboy

module.exports.Dicer = Dicer


/***/ }),

/***/ 29584:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



// TODO:
//  * support 1 nested multipart level
//    (see second multipart example here:
//     http://www.w3.org/TR/html401/interact/forms.html#didx-multipartform-data)
//  * support limits.fieldNameSize
//     -- this will require modifications to utils.parseParams

const { Readable } = __webpack_require__(57075)
const { inherits } = __webpack_require__(57975)

const Dicer = __webpack_require__(47702)

const parseParams = __webpack_require__(42521)
const decodeText = __webpack_require__(80227)
const basename = __webpack_require__(21996)
const getLimit = __webpack_require__(96305)

const RE_BOUNDARY = /^boundary$/i
const RE_FIELD = /^form-data$/i
const RE_CHARSET = /^charset$/i
const RE_FILENAME = /^filename$/i
const RE_NAME = /^name$/i

Multipart.detect = /^multipart\/form-data/i
function Multipart (boy, cfg) {
  let i
  let len
  const self = this
  let boundary
  const limits = cfg.limits
  const isPartAFile = cfg.isPartAFile || ((fieldName, contentType, fileName) => (contentType === 'application/octet-stream' || fileName !== undefined))
  const parsedConType = cfg.parsedConType || []
  const defCharset = cfg.defCharset || 'utf8'
  const preservePath = cfg.preservePath
  const fileOpts = { highWaterMark: cfg.fileHwm }

  for (i = 0, len = parsedConType.length; i < len; ++i) {
    if (Array.isArray(parsedConType[i]) &&
      RE_BOUNDARY.test(parsedConType[i][0])) {
      boundary = parsedConType[i][1]
      break
    }
  }

  function checkFinished () {
    if (nends === 0 && finished && !boy._done) {
      finished = false
      self.end()
    }
  }

  if (typeof boundary !== 'string') { throw new Error('Multipart: Boundary not found') }

  const fieldSizeLimit = getLimit(limits, 'fieldSize', 1 * 1024 * 1024)
  const fileSizeLimit = getLimit(limits, 'fileSize', Infinity)
  const filesLimit = getLimit(limits, 'files', Infinity)
  const fieldsLimit = getLimit(limits, 'fields', Infinity)
  const partsLimit = getLimit(limits, 'parts', Infinity)
  const headerPairsLimit = getLimit(limits, 'headerPairs', 2000)
  const headerSizeLimit = getLimit(limits, 'headerSize', 80 * 1024)

  let nfiles = 0
  let nfields = 0
  let nends = 0
  let curFile
  let curField
  let finished = false

  this._needDrain = false
  this._pause = false
  this._cb = undefined
  this._nparts = 0
  this._boy = boy

  const parserCfg = {
    boundary,
    maxHeaderPairs: headerPairsLimit,
    maxHeaderSize: headerSizeLimit,
    partHwm: fileOpts.highWaterMark,
    highWaterMark: cfg.highWaterMark
  }

  this.parser = new Dicer(parserCfg)
  this.parser.on('drain', function () {
    self._needDrain = false
    if (self._cb && !self._pause) {
      const cb = self._cb
      self._cb = undefined
      cb()
    }
  }).on('part', function onPart (part) {
    if (++self._nparts > partsLimit) {
      self.parser.removeListener('part', onPart)
      self.parser.on('part', skipPart)
      boy.hitPartsLimit = true
      boy.emit('partsLimit')
      return skipPart(part)
    }

    // hack because streams2 _always_ doesn't emit 'end' until nextTick, so let
    // us emit 'end' early since we know the part has ended if we are already
    // seeing the next part
    if (curField) {
      const field = curField
      field.emit('end')
      field.removeAllListeners('end')
    }

    part.on('header', function (header) {
      let contype
      let fieldname
      let parsed
      let charset
      let encoding
      let filename
      let nsize = 0

      if (header['content-type']) {
        parsed = parseParams(header['content-type'][0])
        if (parsed[0]) {
          contype = parsed[0].toLowerCase()
          for (i = 0, len = parsed.length; i < len; ++i) {
            if (RE_CHARSET.test(parsed[i][0])) {
              charset = parsed[i][1].toLowerCase()
              break
            }
          }
        }
      }

      if (contype === undefined) { contype = 'text/plain' }
      if (charset === undefined) { charset = defCharset }

      if (header['content-disposition']) {
        parsed = parseParams(header['content-disposition'][0])
        if (!RE_FIELD.test(parsed[0])) { return skipPart(part) }
        for (i = 0, len = parsed.length; i < len; ++i) {
          if (RE_NAME.test(parsed[i][0])) {
            fieldname = parsed[i][1]
          } else if (RE_FILENAME.test(parsed[i][0])) {
            filename = parsed[i][1]
            if (!preservePath) { filename = basename(filename) }
          }
        }
      } else { return skipPart(part) }

      if (header['content-transfer-encoding']) { encoding = header['content-transfer-encoding'][0].toLowerCase() } else { encoding = '7bit' }

      let onData,
        onEnd

      if (isPartAFile(fieldname, contype, filename)) {
        // file/binary field
        if (nfiles === filesLimit) {
          if (!boy.hitFilesLimit) {
            boy.hitFilesLimit = true
            boy.emit('filesLimit')
          }
          return skipPart(part)
        }

        ++nfiles

        if (boy.listenerCount('file') === 0) {
          self.parser._ignore()
          return
        }

        ++nends
        const file = new FileStream(fileOpts)
        curFile = file
        file.on('end', function () {
          --nends
          self._pause = false
          checkFinished()
          if (self._cb && !self._needDrain) {
            const cb = self._cb
            self._cb = undefined
            cb()
          }
        })
        file._read = function (n) {
          if (!self._pause) { return }
          self._pause = false
          if (self._cb && !self._needDrain) {
            const cb = self._cb
            self._cb = undefined
            cb()
          }
        }
        boy.emit('file', fieldname, file, filename, encoding, contype)

        onData = function (data) {
          if ((nsize += data.length) > fileSizeLimit) {
            const extralen = fileSizeLimit - nsize + data.length
            if (extralen > 0) { file.push(data.slice(0, extralen)) }
            file.truncated = true
            file.bytesRead = fileSizeLimit
            part.removeAllListeners('data')
            file.emit('limit')
            return
          } else if (!file.push(data)) { self._pause = true }

          file.bytesRead = nsize
        }

        onEnd = function () {
          curFile = undefined
          file.push(null)
        }
      } else {
        // non-file field
        if (nfields === fieldsLimit) {
          if (!boy.hitFieldsLimit) {
            boy.hitFieldsLimit = true
            boy.emit('fieldsLimit')
          }
          return skipPart(part)
        }

        ++nfields
        ++nends
        let buffer = ''
        let truncated = false
        curField = part

        onData = function (data) {
          if ((nsize += data.length) > fieldSizeLimit) {
            const extralen = (fieldSizeLimit - (nsize - data.length))
            buffer += data.toString('binary', 0, extralen)
            truncated = true
            part.removeAllListeners('data')
          } else { buffer += data.toString('binary') }
        }

        onEnd = function () {
          curField = undefined
          if (buffer.length) { buffer = decodeText(buffer, 'binary', charset) }
          boy.emit('field', fieldname, buffer, false, truncated, encoding, contype)
          --nends
          checkFinished()
        }
      }

      /* As of node@2efe4ab761666 (v0.10.29+/v0.11.14+), busboy had become
         broken. Streams2/streams3 is a huge black box of confusion, but
         somehow overriding the sync state seems to fix things again (and still
         seems to work for previous node versions).
      */
      part._readableState.sync = false

      part.on('data', onData)
      part.on('end', onEnd)
    }).on('error', function (err) {
      if (curFile) { curFile.emit('error', err) }
    })
  }).on('error', function (err) {
    boy.emit('error', err)
  }).on('finish', function () {
    finished = true
    checkFinished()
  })
}

Multipart.prototype.write = function (chunk, cb) {
  const r = this.parser.write(chunk)
  if (r && !this._pause) {
    cb()
  } else {
    this._needDrain = !r
    this._cb = cb
  }
}

Multipart.prototype.end = function () {
  const self = this

  if (self.parser.writable) {
    self.parser.end()
  } else if (!self._boy._done) {
    process.nextTick(function () {
      self._boy._done = true
      self._boy.emit('finish')
    })
  }
}

function skipPart (part) {
  part.resume()
}

function FileStream (opts) {
  Readable.call(this, opts)

  this.bytesRead = 0

  this.truncated = false
}

inherits(FileStream, Readable)

FileStream.prototype._read = function (n) {}

module.exports = Multipart


/***/ }),

/***/ 29596:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const Decoder = __webpack_require__(41280)
const decodeText = __webpack_require__(80227)
const getLimit = __webpack_require__(96305)

const RE_CHARSET = /^charset$/i

UrlEncoded.detect = /^application\/x-www-form-urlencoded/i
function UrlEncoded (boy, cfg) {
  const limits = cfg.limits
  const parsedConType = cfg.parsedConType
  this.boy = boy

  this.fieldSizeLimit = getLimit(limits, 'fieldSize', 1 * 1024 * 1024)
  this.fieldNameSizeLimit = getLimit(limits, 'fieldNameSize', 100)
  this.fieldsLimit = getLimit(limits, 'fields', Infinity)

  let charset
  for (var i = 0, len = parsedConType.length; i < len; ++i) { // eslint-disable-line no-var
    if (Array.isArray(parsedConType[i]) &&
        RE_CHARSET.test(parsedConType[i][0])) {
      charset = parsedConType[i][1].toLowerCase()
      break
    }
  }

  if (charset === undefined) { charset = cfg.defCharset || 'utf8' }

  this.decoder = new Decoder()
  this.charset = charset
  this._fields = 0
  this._state = 'key'
  this._checkingBytes = true
  this._bytesKey = 0
  this._bytesVal = 0
  this._key = ''
  this._val = ''
  this._keyTrunc = false
  this._valTrunc = false
  this._hitLimit = false
}

UrlEncoded.prototype.write = function (data, cb) {
  if (this._fields === this.fieldsLimit) {
    if (!this.boy.hitFieldsLimit) {
      this.boy.hitFieldsLimit = true
      this.boy.emit('fieldsLimit')
    }
    return cb()
  }

  let idxeq; let idxamp; let i; let p = 0; const len = data.length

  while (p < len) {
    if (this._state === 'key') {
      idxeq = idxamp = undefined
      for (i = p; i < len; ++i) {
        if (!this._checkingBytes) { ++p }
        if (data[i] === 0x3D/* = */) {
          idxeq = i
          break
        } else if (data[i] === 0x26/* & */) {
          idxamp = i
          break
        }
        if (this._checkingBytes && this._bytesKey === this.fieldNameSizeLimit) {
          this._hitLimit = true
          break
        } else if (this._checkingBytes) { ++this._bytesKey }
      }

      if (idxeq !== undefined) {
        // key with assignment
        if (idxeq > p) { this._key += this.decoder.write(data.toString('binary', p, idxeq)) }
        this._state = 'val'

        this._hitLimit = false
        this._checkingBytes = true
        this._val = ''
        this._bytesVal = 0
        this._valTrunc = false
        this.decoder.reset()

        p = idxeq + 1
      } else if (idxamp !== undefined) {
        // key with no assignment
        ++this._fields
        let key; const keyTrunc = this._keyTrunc
        if (idxamp > p) { key = (this._key += this.decoder.write(data.toString('binary', p, idxamp))) } else { key = this._key }

        this._hitLimit = false
        this._checkingBytes = true
        this._key = ''
        this._bytesKey = 0
        this._keyTrunc = false
        this.decoder.reset()

        if (key.length) {
          this.boy.emit('field', decodeText(key, 'binary', this.charset),
            '',
            keyTrunc,
            false)
        }

        p = idxamp + 1
        if (this._fields === this.fieldsLimit) { return cb() }
      } else if (this._hitLimit) {
        // we may not have hit the actual limit if there are encoded bytes...
        if (i > p) { this._key += this.decoder.write(data.toString('binary', p, i)) }
        p = i
        if ((this._bytesKey = this._key.length) === this.fieldNameSizeLimit) {
          // yep, we actually did hit the limit
          this._checkingBytes = false
          this._keyTrunc = true
        }
      } else {
        if (p < len) { this._key += this.decoder.write(data.toString('binary', p)) }
        p = len
      }
    } else {
      idxamp = undefined
      for (i = p; i < len; ++i) {
        if (!this._checkingBytes) { ++p }
        if (data[i] === 0x26/* & */) {
          idxamp = i
          break
        }
        if (this._checkingBytes && this._bytesVal === this.fieldSizeLimit) {
          this._hitLimit = true
          break
        } else if (this._checkingBytes) { ++this._bytesVal }
      }

      if (idxamp !== undefined) {
        ++this._fields
        if (idxamp > p) { this._val += this.decoder.write(data.toString('binary', p, idxamp)) }
        this.boy.emit('field', decodeText(this._key, 'binary', this.charset),
          decodeText(this._val, 'binary', this.charset),
          this._keyTrunc,
          this._valTrunc)
        this._state = 'key'

        this._hitLimit = false
        this._checkingBytes = true
        this._key = ''
        this._bytesKey = 0
        this._keyTrunc = false
        this.decoder.reset()

        p = idxamp + 1
        if (this._fields === this.fieldsLimit) { return cb() }
      } else if (this._hitLimit) {
        // we may not have hit the actual limit if there are encoded bytes...
        if (i > p) { this._val += this.decoder.write(data.toString('binary', p, i)) }
        p = i
        if ((this._val === '' && this.fieldSizeLimit === 0) ||
            (this._bytesVal = this._val.length) === this.fieldSizeLimit) {
          // yep, we actually did hit the limit
          this._checkingBytes = false
          this._valTrunc = true
        }
      } else {
        if (p < len) { this._val += this.decoder.write(data.toString('binary', p)) }
        p = len
      }
    }
  }
  cb()
}

UrlEncoded.prototype.end = function () {
  if (this.boy._done) { return }

  if (this._state === 'key' && this._key.length > 0) {
    this.boy.emit('field', decodeText(this._key, 'binary', this.charset),
      '',
      this._keyTrunc,
      false)
  } else if (this._state === 'val') {
    this.boy.emit('field', decodeText(this._key, 'binary', this.charset),
      decodeText(this._val, 'binary', this.charset),
      this._keyTrunc,
      this._valTrunc)
  }
  this.boy._done = true
  this.boy.emit('finish')
}

module.exports = UrlEncoded


/***/ }),

/***/ 41280:
/***/ ((module) => {



const RE_PLUS = /\+/g

const HEX = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]

function Decoder () {
  this.buffer = undefined
}
Decoder.prototype.write = function (str) {
  // Replace '+' with ' ' before decoding
  str = str.replace(RE_PLUS, ' ')
  let res = ''
  let i = 0; let p = 0; const len = str.length
  for (; i < len; ++i) {
    if (this.buffer !== undefined) {
      if (!HEX[str.charCodeAt(i)]) {
        res += '%' + this.buffer
        this.buffer = undefined
        --i // retry character
      } else {
        this.buffer += str[i]
        ++p
        if (this.buffer.length === 2) {
          res += String.fromCharCode(parseInt(this.buffer, 16))
          this.buffer = undefined
        }
      }
    } else if (str[i] === '%') {
      if (i > p) {
        res += str.substring(p, i)
        p = i
      }
      this.buffer = ''
      ++p
    }
  }
  if (p < len && this.buffer === undefined) { res += str.substring(p) }
  return res
}
Decoder.prototype.reset = function () {
  this.buffer = undefined
}

module.exports = Decoder


/***/ }),

/***/ 21996:
/***/ ((module) => {



module.exports = function basename (path) {
  if (typeof path !== 'string') { return '' }
  for (var i = path.length - 1; i >= 0; --i) { // eslint-disable-line no-var
    switch (path.charCodeAt(i)) {
      case 0x2F: // '/'
      case 0x5C: // '\'
        path = path.slice(i + 1)
        return (path === '..' || path === '.' ? '' : path)
    }
  }
  return (path === '..' || path === '.' ? '' : path)
}


/***/ }),

/***/ 80227:
/***/ (function(module) {



// Node has always utf-8
const utf8Decoder = new TextDecoder('utf-8')
const textDecoders = new Map([
  ['utf-8', utf8Decoder],
  ['utf8', utf8Decoder]
])

function getDecoder (charset) {
  let lc
  while (true) {
    switch (charset) {
      case 'utf-8':
      case 'utf8':
        return decoders.utf8
      case 'latin1':
      case 'ascii': // TODO: Make these a separate, strict decoder?
      case 'us-ascii':
      case 'iso-8859-1':
      case 'iso8859-1':
      case 'iso88591':
      case 'iso_8859-1':
      case 'windows-1252':
      case 'iso_8859-1:1987':
      case 'cp1252':
      case 'x-cp1252':
        return decoders.latin1
      case 'utf16le':
      case 'utf-16le':
      case 'ucs2':
      case 'ucs-2':
        return decoders.utf16le
      case 'base64':
        return decoders.base64
      default:
        if (lc === undefined) {
          lc = true
          charset = charset.toLowerCase()
          continue
        }
        return decoders.other.bind(charset)
    }
  }
}

const decoders = {
  utf8: (data, sourceEncoding) => {
    if (data.length === 0) {
      return ''
    }
    if (typeof data === 'string') {
      data = Buffer.from(data, sourceEncoding)
    }
    return data.utf8Slice(0, data.length)
  },

  latin1: (data, sourceEncoding) => {
    if (data.length === 0) {
      return ''
    }
    if (typeof data === 'string') {
      return data
    }
    return data.latin1Slice(0, data.length)
  },

  utf16le: (data, sourceEncoding) => {
    if (data.length === 0) {
      return ''
    }
    if (typeof data === 'string') {
      data = Buffer.from(data, sourceEncoding)
    }
    return data.ucs2Slice(0, data.length)
  },

  base64: (data, sourceEncoding) => {
    if (data.length === 0) {
      return ''
    }
    if (typeof data === 'string') {
      data = Buffer.from(data, sourceEncoding)
    }
    return data.base64Slice(0, data.length)
  },

  other: (data, sourceEncoding) => {
    if (data.length === 0) {
      return ''
    }
    if (typeof data === 'string') {
      data = Buffer.from(data, sourceEncoding)
    }

    if (textDecoders.has(this.toString())) {
      try {
        return textDecoders.get(this).decode(data)
      } catch {}
    }
    return typeof data === 'string'
      ? data
      : data.toString()
  }
}

function decodeText (text, sourceEncoding, destEncoding) {
  if (text) {
    return getDecoder(destEncoding)(text, sourceEncoding)
  }
  return text
}

module.exports = decodeText


/***/ }),

/***/ 96305:
/***/ ((module) => {



module.exports = function getLimit (limits, name, defaultLimit) {
  if (
    !limits ||
    limits[name] === undefined ||
    limits[name] === null
  ) { return defaultLimit }

  if (
    typeof limits[name] !== 'number' ||
    isNaN(limits[name])
  ) { throw new TypeError('Limit ' + name + ' is not a valid number') }

  return limits[name]
}


/***/ }),

/***/ 42521:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable object-property-newline */


const decodeText = __webpack_require__(80227)

const RE_ENCODED = /%[a-fA-F0-9][a-fA-F0-9]/g

const EncodedLookup = {
  '%00': '\x00', '%01': '\x01', '%02': '\x02', '%03': '\x03', '%04': '\x04',
  '%05': '\x05', '%06': '\x06', '%07': '\x07', '%08': '\x08', '%09': '\x09',
  '%0a': '\x0a', '%0A': '\x0a', '%0b': '\x0b', '%0B': '\x0b', '%0c': '\x0c',
  '%0C': '\x0c', '%0d': '\x0d', '%0D': '\x0d', '%0e': '\x0e', '%0E': '\x0e',
  '%0f': '\x0f', '%0F': '\x0f', '%10': '\x10', '%11': '\x11', '%12': '\x12',
  '%13': '\x13', '%14': '\x14', '%15': '\x15', '%16': '\x16', '%17': '\x17',
  '%18': '\x18', '%19': '\x19', '%1a': '\x1a', '%1A': '\x1a', '%1b': '\x1b',
  '%1B': '\x1b', '%1c': '\x1c', '%1C': '\x1c', '%1d': '\x1d', '%1D': '\x1d',
  '%1e': '\x1e', '%1E': '\x1e', '%1f': '\x1f', '%1F': '\x1f', '%20': '\x20',
  '%21': '\x21', '%22': '\x22', '%23': '\x23', '%24': '\x24', '%25': '\x25',
  '%26': '\x26', '%27': '\x27', '%28': '\x28', '%29': '\x29', '%2a': '\x2a',
  '%2A': '\x2a', '%2b': '\x2b', '%2B': '\x2b', '%2c': '\x2c', '%2C': '\x2c',
  '%2d': '\x2d', '%2D': '\x2d', '%2e': '\x2e', '%2E': '\x2e', '%2f': '\x2f',
  '%2F': '\x2f', '%30': '\x30', '%31': '\x31', '%32': '\x32', '%33': '\x33',
  '%34': '\x34', '%35': '\x35', '%36': '\x36', '%37': '\x37', '%38': '\x38',
  '%39': '\x39', '%3a': '\x3a', '%3A': '\x3a', '%3b': '\x3b', '%3B': '\x3b',
  '%3c': '\x3c', '%3C': '\x3c', '%3d': '\x3d', '%3D': '\x3d', '%3e': '\x3e',
  '%3E': '\x3e', '%3f': '\x3f', '%3F': '\x3f', '%40': '\x40', '%41': '\x41',
  '%42': '\x42', '%43': '\x43', '%44': '\x44', '%45': '\x45', '%46': '\x46',
  '%47': '\x47', '%48': '\x48', '%49': '\x49', '%4a': '\x4a', '%4A': '\x4a',
  '%4b': '\x4b', '%4B': '\x4b', '%4c': '\x4c', '%4C': '\x4c', '%4d': '\x4d',
  '%4D': '\x4d', '%4e': '\x4e', '%4E': '\x4e', '%4f': '\x4f', '%4F': '\x4f',
  '%50': '\x50', '%51': '\x51', '%52': '\x52', '%53': '\x53', '%54': '\x54',
  '%55': '\x55', '%56': '\x56', '%57': '\x57', '%58': '\x58', '%59': '\x59',
  '%5a': '\x5a', '%5A': '\x5a', '%5b': '\x5b', '%5B': '\x5b', '%5c': '\x5c',
  '%5C': '\x5c', '%5d': '\x5d', '%5D': '\x5d', '%5e': '\x5e', '%5E': '\x5e',
  '%5f': '\x5f', '%5F': '\x5f', '%60': '\x60', '%61': '\x61', '%62': '\x62',
  '%63': '\x63', '%64': '\x64', '%65': '\x65', '%66': '\x66', '%67': '\x67',
  '%68': '\x68', '%69': '\x69', '%6a': '\x6a', '%6A': '\x6a', '%6b': '\x6b',
  '%6B': '\x6b', '%6c': '\x6c', '%6C': '\x6c', '%6d': '\x6d', '%6D': '\x6d',
  '%6e': '\x6e', '%6E': '\x6e', '%6f': '\x6f', '%6F': '\x6f', '%70': '\x70',
  '%71': '\x71', '%72': '\x72', '%73': '\x73', '%74': '\x74', '%75': '\x75',
  '%76': '\x76', '%77': '\x77', '%78': '\x78', '%79': '\x79', '%7a': '\x7a',
  '%7A': '\x7a', '%7b': '\x7b', '%7B': '\x7b', '%7c': '\x7c', '%7C': '\x7c',
  '%7d': '\x7d', '%7D': '\x7d', '%7e': '\x7e', '%7E': '\x7e', '%7f': '\x7f',
  '%7F': '\x7f', '%80': '\x80', '%81': '\x81', '%82': '\x82', '%83': '\x83',
  '%84': '\x84', '%85': '\x85', '%86': '\x86', '%87': '\x87', '%88': '\x88',
  '%89': '\x89', '%8a': '\x8a', '%8A': '\x8a', '%8b': '\x8b', '%8B': '\x8b',
  '%8c': '\x8c', '%8C': '\x8c', '%8d': '\x8d', '%8D': '\x8d', '%8e': '\x8e',
  '%8E': '\x8e', '%8f': '\x8f', '%8F': '\x8f', '%90': '\x90', '%91': '\x91',
  '%92': '\x92', '%93': '\x93', '%94': '\x94', '%95': '\x95', '%96': '\x96',
  '%97': '\x97', '%98': '\x98', '%99': '\x99', '%9a': '\x9a', '%9A': '\x9a',
  '%9b': '\x9b', '%9B': '\x9b', '%9c': '\x9c', '%9C': '\x9c', '%9d': '\x9d',
  '%9D': '\x9d', '%9e': '\x9e', '%9E': '\x9e', '%9f': '\x9f', '%9F': '\x9f',
  '%a0': '\xa0', '%A0': '\xa0', '%a1': '\xa1', '%A1': '\xa1', '%a2': '\xa2',
  '%A2': '\xa2', '%a3': '\xa3', '%A3': '\xa3', '%a4': '\xa4', '%A4': '\xa4',
  '%a5': '\xa5', '%A5': '\xa5', '%a6': '\xa6', '%A6': '\xa6', '%a7': '\xa7',
  '%A7': '\xa7', '%a8': '\xa8', '%A8': '\xa8', '%a9': '\xa9', '%A9': '\xa9',
  '%aa': '\xaa', '%Aa': '\xaa', '%aA': '\xaa', '%AA': '\xaa', '%ab': '\xab',
  '%Ab': '\xab', '%aB': '\xab', '%AB': '\xab', '%ac': '\xac', '%Ac': '\xac',
  '%aC': '\xac', '%AC': '\xac', '%ad': '\xad', '%Ad': '\xad', '%aD': '\xad',
  '%AD': '\xad', '%ae': '\xae', '%Ae': '\xae', '%aE': '\xae', '%AE': '\xae',
  '%af': '\xaf', '%Af': '\xaf', '%aF': '\xaf', '%AF': '\xaf', '%b0': '\xb0',
  '%B0': '\xb0', '%b1': '\xb1', '%B1': '\xb1', '%b2': '\xb2', '%B2': '\xb2',
  '%b3': '\xb3', '%B3': '\xb3', '%b4': '\xb4', '%B4': '\xb4', '%b5': '\xb5',
  '%B5': '\xb5', '%b6': '\xb6', '%B6': '\xb6', '%b7': '\xb7', '%B7': '\xb7',
  '%b8': '\xb8', '%B8': '\xb8', '%b9': '\xb9', '%B9': '\xb9', '%ba': '\xba',
  '%Ba': '\xba', '%bA': '\xba', '%BA': '\xba', '%bb': '\xbb', '%Bb': '\xbb',
  '%bB': '\xbb', '%BB': '\xbb', '%bc': '\xbc', '%Bc': '\xbc', '%bC': '\xbc',
  '%BC': '\xbc', '%bd': '\xbd', '%Bd': '\xbd', '%bD': '\xbd', '%BD': '\xbd',
  '%be': '\xbe', '%Be': '\xbe', '%bE': '\xbe', '%BE': '\xbe', '%bf': '\xbf',
  '%Bf': '\xbf', '%bF': '\xbf', '%BF': '\xbf', '%c0': '\xc0', '%C0': '\xc0',
  '%c1': '\xc1', '%C1': '\xc1', '%c2': '\xc2', '%C2': '\xc2', '%c3': '\xc3',
  '%C3': '\xc3', '%c4': '\xc4', '%C4': '\xc4', '%c5': '\xc5', '%C5': '\xc5',
  '%c6': '\xc6', '%C6': '\xc6', '%c7': '\xc7', '%C7': '\xc7', '%c8': '\xc8',
  '%C8': '\xc8', '%c9': '\xc9', '%C9': '\xc9', '%ca': '\xca', '%Ca': '\xca',
  '%cA': '\xca', '%CA': '\xca', '%cb': '\xcb', '%Cb': '\xcb', '%cB': '\xcb',
  '%CB': '\xcb', '%cc': '\xcc', '%Cc': '\xcc', '%cC': '\xcc', '%CC': '\xcc',
  '%cd': '\xcd', '%Cd': '\xcd', '%cD': '\xcd', '%CD': '\xcd', '%ce': '\xce',
  '%Ce': '\xce', '%cE': '\xce', '%CE': '\xce', '%cf': '\xcf', '%Cf': '\xcf',
  '%cF': '\xcf', '%CF': '\xcf', '%d0': '\xd0', '%D0': '\xd0', '%d1': '\xd1',
  '%D1': '\xd1', '%d2': '\xd2', '%D2': '\xd2', '%d3': '\xd3', '%D3': '\xd3',
  '%d4': '\xd4', '%D4': '\xd4', '%d5': '\xd5', '%D5': '\xd5', '%d6': '\xd6',
  '%D6': '\xd6', '%d7': '\xd7', '%D7': '\xd7', '%d8': '\xd8', '%D8': '\xd8',
  '%d9': '\xd9', '%D9': '\xd9', '%da': '\xda', '%Da': '\xda', '%dA': '\xda',
  '%DA': '\xda', '%db': '\xdb', '%Db': '\xdb', '%dB': '\xdb', '%DB': '\xdb',
  '%dc': '\xdc', '%Dc': '\xdc', '%dC': '\xdc', '%DC': '\xdc', '%dd': '\xdd',
  '%Dd': '\xdd', '%dD': '\xdd', '%DD': '\xdd', '%de': '\xde', '%De': '\xde',
  '%dE': '\xde', '%DE': '\xde', '%df': '\xdf', '%Df': '\xdf', '%dF': '\xdf',
  '%DF': '\xdf', '%e0': '\xe0', '%E0': '\xe0', '%e1': '\xe1', '%E1': '\xe1',
  '%e2': '\xe2', '%E2': '\xe2', '%e3': '\xe3', '%E3': '\xe3', '%e4': '\xe4',
  '%E4': '\xe4', '%e5': '\xe5', '%E5': '\xe5', '%e6': '\xe6', '%E6': '\xe6',
  '%e7': '\xe7', '%E7': '\xe7', '%e8': '\xe8', '%E8': '\xe8', '%e9': '\xe9',
  '%E9': '\xe9', '%ea': '\xea', '%Ea': '\xea', '%eA': '\xea', '%EA': '\xea',
  '%eb': '\xeb', '%Eb': '\xeb', '%eB': '\xeb', '%EB': '\xeb', '%ec': '\xec',
  '%Ec': '\xec', '%eC': '\xec', '%EC': '\xec', '%ed': '\xed', '%Ed': '\xed',
  '%eD': '\xed', '%ED': '\xed', '%ee': '\xee', '%Ee': '\xee', '%eE': '\xee',
  '%EE': '\xee', '%ef': '\xef', '%Ef': '\xef', '%eF': '\xef', '%EF': '\xef',
  '%f0': '\xf0', '%F0': '\xf0', '%f1': '\xf1', '%F1': '\xf1', '%f2': '\xf2',
  '%F2': '\xf2', '%f3': '\xf3', '%F3': '\xf3', '%f4': '\xf4', '%F4': '\xf4',
  '%f5': '\xf5', '%F5': '\xf5', '%f6': '\xf6', '%F6': '\xf6', '%f7': '\xf7',
  '%F7': '\xf7', '%f8': '\xf8', '%F8': '\xf8', '%f9': '\xf9', '%F9': '\xf9',
  '%fa': '\xfa', '%Fa': '\xfa', '%fA': '\xfa', '%FA': '\xfa', '%fb': '\xfb',
  '%Fb': '\xfb', '%fB': '\xfb', '%FB': '\xfb', '%fc': '\xfc', '%Fc': '\xfc',
  '%fC': '\xfc', '%FC': '\xfc', '%fd': '\xfd', '%Fd': '\xfd', '%fD': '\xfd',
  '%FD': '\xfd', '%fe': '\xfe', '%Fe': '\xfe', '%fE': '\xfe', '%FE': '\xfe',
  '%ff': '\xff', '%Ff': '\xff', '%fF': '\xff', '%FF': '\xff'
}

function encodedReplacer (match) {
  return EncodedLookup[match]
}

const STATE_KEY = 0
const STATE_VALUE = 1
const STATE_CHARSET = 2
const STATE_LANG = 3

function parseParams (str) {
  const res = []
  let state = STATE_KEY
  let charset = ''
  let inquote = false
  let escaping = false
  let p = 0
  let tmp = ''
  const len = str.length

  for (var i = 0; i < len; ++i) { // eslint-disable-line no-var
    const char = str[i]
    if (char === '\\' && inquote) {
      if (escaping) { escaping = false } else {
        escaping = true
        continue
      }
    } else if (char === '"') {
      if (!escaping) {
        if (inquote) {
          inquote = false
          state = STATE_KEY
          // Skip any remaining characters until we hit a semicolon or end of string
          // This ensures we don't include characters after the closing quote
          while (i + 1 < len && str[i + 1] !== ';') {
            ++i
          }
        } else { inquote = true }
        continue
      } else { escaping = false }
    } else {
      if (escaping && inquote) { tmp += '\\' }
      escaping = false
      if ((state === STATE_CHARSET || state === STATE_LANG) && char === "'") {
        if (state === STATE_CHARSET) {
          state = STATE_LANG
          charset = tmp.substring(1)
        } else { state = STATE_VALUE }
        tmp = ''
        continue
      } else if (state === STATE_KEY &&
        (char === '*' || char === '=') &&
        res.length) {
        state = char === '*'
          ? STATE_CHARSET
          : STATE_VALUE
        res[p] = [tmp, undefined]
        tmp = ''
        continue
      } else if (!inquote && char === ';') {
        state = STATE_KEY
        if (charset) {
          if (tmp.length) {
            tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
              'binary',
              charset)
          }
          charset = ''
        } else if (tmp.length) {
          tmp = decodeText(tmp, 'binary', 'utf8')
        }
        if (res[p] === undefined) { res[p] = tmp } else { res[p][1] = tmp }
        tmp = ''
        ++p
        continue
      } else if (!inquote && (char === ' ' || char === '\t')) { continue }
    }
    tmp += char
  }
  if (charset && tmp.length) {
    tmp = decodeText(tmp.replace(RE_ENCODED, encodedReplacer),
      'binary',
      charset)
  } else if (tmp) {
    tmp = decodeText(tmp, 'binary', 'utf8')
  }

  if (res[p] === undefined) {
    if (tmp) { res[p] = tmp }
  } else { res[p][1] = tmp }

  return res
}

module.exports = parseParams


/***/ }),

/***/ 46532:
/***/ ((module) => {



// based on https://github.com/TehShrike/deepmerge
// MIT License
// Copyright (c) 2012 - 2022 James Halliday, Josh Duff, and other contributors of deepmerge

const JSON_PROTO = Object.getPrototypeOf({})

function defaultIsMergeableObjectFactory () {
  return function defaultIsMergeableObject (value) {
    return typeof value === 'object' && value !== null && !(value instanceof RegExp) && !(value instanceof Date)
  }
}

function deepmergeConstructor (options) {
  function isNotPrototypeKey (value) {
    return (
      value !== 'constructor' &&
      value !== 'prototype' &&
      value !== '__proto__'
    )
  }

  function cloneArray (value) {
    let i = 0
    const il = value.length
    const result = new Array(il)
    for (i; i < il; ++i) {
      result[i] = clone(value[i])
    }
    return result
  }

  function cloneObject (target) {
    const result = {}

    if (cloneProtoObject && Object.getPrototypeOf(target) !== JSON_PROTO) {
      return cloneProtoObject(target)
    }

    const targetKeys = getKeys(target)
    let i, il, key
    for (i = 0, il = targetKeys.length; i < il; ++i) {
      isNotPrototypeKey(key = targetKeys[i]) &&
        (result[key] = clone(target[key]))
    }
    return result
  }

  function concatArrays (target, source) {
    const tl = target.length
    const sl = source.length
    let i = 0
    const result = new Array(tl + sl)
    for (i; i < tl; ++i) {
      result[i] = clone(target[i])
    }
    for (i = 0; i < sl; ++i) {
      result[i + tl] = clone(source[i])
    }
    return result
  }

  const propertyIsEnumerable = Object.prototype.propertyIsEnumerable
  function getSymbolsAndKeys (value) {
    const result = Object.keys(value)
    const keys = Object.getOwnPropertySymbols(value)
    for (let i = 0, il = keys.length; i < il; ++i) {
      propertyIsEnumerable.call(value, keys[i]) && result.push(keys[i])
    }
    return result
  }

  const getKeys = options?.symbols
    ? getSymbolsAndKeys
    : Object.keys

  const cloneProtoObject = typeof options?.cloneProtoObject === 'function'
    ? options.cloneProtoObject
    : undefined

  const isMergeableObject = typeof options?.isMergeableObject === 'function'
    ? options.isMergeableObject
    : defaultIsMergeableObjectFactory()

  const onlyDefinedProperties = options?.onlyDefinedProperties === true

  function isPrimitive (value) {
    return typeof value !== 'object' || value === null
  }

  const mergeArray = options && typeof options.mergeArray === 'function'
    ? options.mergeArray({ clone, deepmerge: _deepmerge, getKeys, isMergeableObject })
    : concatArrays

  function clone (entry) {
    return isMergeableObject(entry)
      ? Array.isArray(entry)
        ? cloneArray(entry)
        : cloneObject(entry)
      : entry
  }

  function mergeObject (target, source) {
    const result = {}
    const targetKeys = getKeys(target)
    const sourceKeys = getKeys(source)
    let i, il, key
    for (i = 0, il = targetKeys.length; i < il; ++i) {
      isNotPrototypeKey(key = targetKeys[i]) &&
      (sourceKeys.indexOf(key) === -1) &&
      (result[key] = clone(target[key]))
    }

    for (i = 0, il = sourceKeys.length; i < il; ++i) {
      if (!isNotPrototypeKey(key = sourceKeys[i])) {
        continue
      }

      if (key in target) {
        if (targetKeys.indexOf(key) !== -1) {
          if (cloneProtoObject && isMergeableObject(source[key]) && Object.getPrototypeOf(source[key]) !== JSON_PROTO) {
            result[key] = cloneProtoObject(source[key])
          } else {
            result[key] = _deepmerge(target[key], source[key])
          }
        }
      } else {
        if (onlyDefinedProperties && typeof source[key] === 'undefined') {
          continue
        }
        result[key] = clone(source[key])
      }
    }
    return result
  }

  function _deepmerge (target, source) {
    if (onlyDefinedProperties && typeof source === 'undefined') {
      return clone(target)
    }

    const sourceIsArray = Array.isArray(source)
    const targetIsArray = Array.isArray(target)

    if (isPrimitive(source)) {
      return source
    } else if (!isMergeableObject(target)) {
      return clone(source)
    } else if (sourceIsArray && targetIsArray) {
      return mergeArray(target, source)
    } else if (sourceIsArray !== targetIsArray) {
      return clone(source)
    } else {
      return mergeObject(target, source)
    }
  }

  function _deepmergeAll () {
    switch (arguments.length) {
      case 0:
        return {}
      case 1:
        return clone(arguments[0])
      case 2:
        return _deepmerge(arguments[0], arguments[1])
    }
    let result
    for (let i = 0, il = arguments.length; i < il; ++i) {
      result = _deepmerge(result, arguments[i])
    }
    return result
  }

  return options?.all
    ? _deepmergeAll
    : _deepmerge
}

module.exports = deepmergeConstructor
module.exports["default"] = deepmergeConstructor
module.exports.deepmerge = deepmergeConstructor

Object.defineProperty(module.exports, "isMergeableObject", ({
  get: defaultIsMergeableObjectFactory
}))


/***/ }),

/***/ 66138:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



const Busboy = __webpack_require__(98149)
const os = __webpack_require__(48161)
const fp = __webpack_require__(31550)
const { createWriteStream } = __webpack_require__(73024)
const { unlink } = __webpack_require__(51455)
const path = __webpack_require__(76760)
const { generateId } = __webpack_require__(92710)
const createError = __webpack_require__(31524)
const streamToNull = __webpack_require__(88665)
const deepmergeAll = __webpack_require__(46532)({ all: true })
const { PassThrough, Readable } = __webpack_require__(57075)
const { pipeline: pump } = __webpack_require__(46466)
const secureJSON = __webpack_require__(77675)

const kMultipart = Symbol('multipart')
const kMultipartHandler = Symbol('multipartHandler')

const PartsLimitError = createError('FST_PARTS_LIMIT', 'reach parts limit', 413)
const FilesLimitError = createError('FST_FILES_LIMIT', 'reach files limit', 413)
const FieldsLimitError = createError('FST_FIELDS_LIMIT', 'reach fields limit', 413)
const RequestFileTooLargeError = createError('FST_REQ_FILE_TOO_LARGE', 'request file too large', 413)
const PrototypeViolationError = createError('FST_PROTO_VIOLATION', 'prototype property is not allowed as field name', 400)
const InvalidMultipartContentTypeError = createError('FST_INVALID_MULTIPART_CONTENT_TYPE', 'the request is not multipart', 406)
const InvalidJSONFieldError = createError('FST_INVALID_JSON_FIELD_ERROR', 'a request field is not a valid JSON as declared by its Content-Type', 406)
const FileBufferNotFoundError = createError('FST_FILE_BUFFER_NOT_FOUND', 'the file buffer was not found', 500)
const NoFormData = createError('FST_NO_FORM_DATA', 'FormData is not available', 500)

function setMultipart (req, _payload, done) {
  req[kMultipart] = true
  done()
}

function busboy (options) {
  try {
    return new Busboy(options)
  } catch (error) {
    const errorEmitter = new PassThrough()
    process.nextTick(function () {
      errorEmitter.emit('error', error)
    })
    return errorEmitter
  }
}

function fastifyMultipart (fastify, options, done) {
  options.limits = {
    ...options.limits,
    parts: options.limits?.parts || 1000,
    fileSize: options.limits?.fileSize || fastify.initialConfig.bodyLimit
  }

  const attachFieldsToBody = options.attachFieldsToBody

  if (attachFieldsToBody === true || attachFieldsToBody === 'keyValues') {
    if (typeof options.sharedSchemaId === 'string' && attachFieldsToBody === true) {
      fastify.addSchema({
        $id: options.sharedSchemaId,
        type: 'object',
        properties: {
          fieldname: { type: 'string' },
          encoding: { type: 'string' },
          filename: { type: 'string' },
          mimetype: { type: 'string' }
        }
      })
    }

    fastify.addHook('preValidation', async function (req) {
      if (!req.isMultipart()) {
        return
      }

      for await (const part of req.parts(req.routeOptions.config.multipartOptions)) {
        req.body = part.fields

        if (part.file) {
          if (options.onFile) {
            await options.onFile.call(req, part)
          } else {
            await part.toBuffer()
          }
        }
      }

      if (attachFieldsToBody === 'keyValues') {
        const body = {}

        if (req.body) {
          const reqBodyKeys = Object.keys(req.body)

          for (let i = 0; i < reqBodyKeys.length; ++i) {
            const key = reqBodyKeys[i]
            const field = req.body[key]

            /* Don't modify the body if a field doesn't have a value or an attached buffer */
            if (field.value !== undefined) {
              body[key] = field.value
            } else if (field._buf) {
              body[key] = field._buf
            } else if (Array.isArray(field)) {
              const items = []

              for (let i = 0; i < field.length; ++i) {
                const item = field[i]

                if (item.value !== undefined) {
                  items.push(item.value)
                } else if (item._buf) {
                  items.push(item._buf)
                }
              }

              if (items.length) {
                body[key] = items
              }
            }
          }
        }

        req.body = body
      }
    })

    // The following is not available on old Node.js versions
    // so we must skip it in the test coverage
    /* istanbul ignore next */
    if (globalThis.FormData && !fastify.hasRequestDecorator('formData')) {
      fastify.decorateRequest('formData', async function () {
        const formData = new FormData()
        for (const key in this.body) {
          const value = this.body[key]
          if (Array.isArray(value)) {
            for (const item of value) {
              await append(key, item)
            }
          } else {
            await append(key, value)
          }
        }

        async function append (key, entry) {
          /* c8 ignore next: Buffer.isBuffer is not covered and causing `npm test` to fail */
          if (entry.type === 'file' || (attachFieldsToBody === 'keyValues' && Buffer.isBuffer(entry))) {
            // TODO use File constructor with fs.openAsBlob()
            // if attachFieldsToBody is not set
            // https://nodejs.org/api/fs.html#fsopenasblobpath-options
            formData.append(key, new Blob([await entry.toBuffer()], {
              type: entry.mimetype
            }), entry.filename)
          } else {
            formData.append(key, entry.value)
          }
        }

        return formData
      })
    }
  }

  /* istanbul ignore next */
  if (!fastify.hasRequestDecorator('formData')) {
    fastify.decorateRequest('formData', async function () {
      /* c8 ignore next: Next line is not covered and causing `npm test` to fail */
      throw new NoFormData()
    })
  }

  const defaultThrowFileSizeLimit = typeof options.throwFileSizeLimit === 'boolean'
    ? options.throwFileSizeLimit
    : true

  fastify.decorate('multipartErrors', {
    PartsLimitError,
    FilesLimitError,
    FieldsLimitError,
    PrototypeViolationError,
    InvalidMultipartContentTypeError,
    RequestFileTooLargeError,
    FileBufferNotFoundError
  })

  fastify.addContentTypeParser('multipart/form-data', setMultipart)
  fastify.decorateRequest(kMultipart, false)
  fastify.decorateRequest(kMultipartHandler, handleMultipart)

  fastify.decorateRequest('parts', getMultipartIterator)

  fastify.decorateRequest('isMultipart', isMultipart)
  fastify.decorateRequest('tmpUploads', null)
  fastify.decorateRequest('savedRequestFiles', null)

  // Stream mode
  fastify.decorateRequest('file', getMultipartFile)
  fastify.decorateRequest('files', getMultipartFiles)

  // Disk mode
  fastify.decorateRequest('saveRequestFiles', saveRequestFiles)
  fastify.decorateRequest('cleanRequestFiles', cleanRequestFiles)

  fastify.addHook('onResponse', async (request) => {
    await request.cleanRequestFiles()
  })

  function isMultipart () {
    return this[kMultipart]
  }

  function handleMultipart (opts = {}) {
    if (!this.isMultipart()) {
      throw new InvalidMultipartContentTypeError()
    }

    this.log.debug('starting multipart parsing')

    let values = []
    let pendingHandler = null

    // only one file / field can be processed at a time
    // "null" will close the consumer side
    const ch = (val) => {
      if (pendingHandler) {
        pendingHandler(val)
        pendingHandler = null
      } else {
        values.push(val)
      }
    }

    const handle = (handler) => {
      if (values.length > 0) {
        const value = values[0]
        values = values.slice(1)
        handler(value)
      } else {
        pendingHandler = handler
      }
    }

    const parts = () => {
      return new Promise((resolve, reject) => {
        handle((val) => {
          if (val instanceof Error) {
            if (val.message === 'Unexpected end of multipart data') {
              // Stop parsing without throwing an error
              resolve(null)
            } else {
              reject(val)
            }
          } else {
            resolve(val)
          }
        })
      })
    }

    const body = {}
    let lastError = null
    let currentFile = null
    const request = this.raw
    const busboyOptions = deepmergeAll(
      { headers: request.headers },
      options,
      opts
    )

    this.log.trace({ busboyOptions }, 'Providing options to busboy')
    const bb = busboy(busboyOptions)

    request.on('close', cleanup)
    request.on('error', cleanup)

    bb
      .on('field', onField)
      .on('file', onFile)
      .on('end', cleanup)
      .on('finish', cleanup)
      .on('close', cleanup)
      .on('error', cleanup)

    bb.on('partsLimit', function () {
      const err = new PartsLimitError()
      onError(err)
      process.nextTick(() => cleanup(err))
    })

    bb.on('filesLimit', function () {
      const err = new FilesLimitError()
      onError(err)
      process.nextTick(() => cleanup(err))
    })

    bb.on('fieldsLimit', function () {
      const err = new FieldsLimitError()
      onError(err)
      process.nextTick(() => cleanup(err))
    })

    request.pipe(bb)

    function onField (name, fieldValue, fieldnameTruncated, valueTruncated, encoding, contentType) {
      // don't overwrite prototypes
      if (name in Object.prototype) {
        onError(new PrototypeViolationError())
        return
      }

      // If it is a JSON field, parse it
      if (contentType.startsWith('application/json')) {
        // If the value was truncated, it can never be a valid JSON. Don't even try to parse
        if (valueTruncated) {
          onError(new InvalidJSONFieldError())
          return
        }

        try {
          fieldValue = secureJSON.parse(fieldValue)
          contentType = 'application/json'
        } catch {
          onError(new InvalidJSONFieldError())
          return
        }
      }

      const value = {
        type: 'field',
        fieldname: name,
        mimetype: contentType,
        encoding,
        value: fieldValue,
        fieldnameTruncated,
        valueTruncated,
        fields: body
      }

      if (body[name] === undefined) {
        body[name] = value
      } else if (Array.isArray(body[name])) {
        body[name].push(value)
      } else {
        body[name] = [body[name], value]
      }

      ch(value)
    }

    function onFile (name, file, filename, encoding, mimetype) {
      // don't overwrite prototypes
      if (name in Object.prototype) {
        // ensure that stream is consumed, any error is suppressed
        streamToNull(file).catch(() => {})
        onError(new PrototypeViolationError())
        return
      }

      const throwFileSizeLimit = typeof opts.throwFileSizeLimit === 'boolean'
        ? opts.throwFileSizeLimit
        : defaultThrowFileSizeLimit

      const value = {
        type: 'file',
        fieldname: name,
        filename,
        encoding,
        mimetype,
        file,
        fields: body,
        _buf: null,
        async toBuffer () {
          if (this._buf) {
            return this._buf
          }
          const fileChunks = []
          let err
          for await (const chunk of this.file) {
            fileChunks.push(chunk)

            if (throwFileSizeLimit && this.file.truncated) {
              err = new RequestFileTooLargeError()
              err.part = this

              onError(err)
              fileChunks.length = 0
            }
          }
          if (err) {
            // throwing in the async iterator will
            // cause the file.destroy() to be called
            // The stream has already been managed by
            // busboy instead
            throw err
          }
          this._buf = Buffer.concat(fileChunks)
          return this._buf
        }
      }

      // Attach error listener immediately to prevent uncaught exceptions
      // This is critical when there's an async operation before req.file() is called,
      // allowing the file stream to emit errors before user code can attach listeners
      // However, we only capture and propagate errors from malformed multipart data
      // (e.g., "Part terminated early"), not errors from normal stream consumption
      file.on('error', function (err) {
        // Only propagate errors that indicate malformed multipart data
        // These are the errors that would cause uncaught exceptions
        if (err.message && err.message.includes('terminated early')) {
          onError(err)
        }
        // Other errors are expected to be handled by the consumer of the stream
      })

      if (throwFileSizeLimit) {
        file.on('limit', function () {
          const err = new RequestFileTooLargeError()
          err.part = value
          onError(err)
        })
      }

      if (body[name] === undefined) {
        body[name] = value
      } else if (Array.isArray(body[name])) {
        body[name].push(value)
      } else {
        body[name] = [body[name], value]
      }
      currentFile = file
      ch(value)
    }

    function onError (err) {
      lastError = err
      currentFile = null
    }

    function cleanup (err) {
      request.unpipe(bb)

      if ((err || request.aborted) && currentFile) {
        currentFile.destroy()
        currentFile = null
      }

      ch(err || lastError || null)
    }

    return parts
  }

  async function saveRequestFiles (options) {
    // Checks if this has already been run
    if (this.savedRequestFiles) {
      return this.savedRequestFiles
    }
    let files
    if (attachFieldsToBody === true) {
      // Skip the whole process if the body is empty
      if (!this.body) {
        return []
      }
      files = filesFromFields.call(this, this.body)
    } else {
      files = await this.files(options)
    }
    this.savedRequestFiles = []
    const tmpdir = options?.tmpdir || os.tmpdir()
    this.tmpUploads = []
    let i = 0
    for await (const file of files) {
      const filepath = path.join(tmpdir, generateId() + path.extname(file.filename || ('file' + i++)))
      const target = createWriteStream(filepath)
      try {
        this.tmpUploads.push(filepath)
        await pump(file.file, target)
        this.savedRequestFiles.push({ ...file, filepath })
      } catch (err) {
        this.log.error({ err }, 'save request file')
        throw err
      }
    }

    return this.savedRequestFiles
  }

  function * filesFromFields (container) {
    try {
      const fields = Array.isArray(container) ? container : Object.values(container)
      for (let i = 0; i < fields.length; ++i) {
        const field = fields[i]
        if (Array.isArray(field)) {
          for (const subField of filesFromFields.call(this, field)) {
            yield subField
          }
        }
        if (!field.file) {
          continue
        }
        if (!field._buf) {
          throw new FileBufferNotFoundError()
        }
        field.file = Readable.from(field._buf)
        yield field
      }
    } catch (err) {
      this.log.error({ err }, 'save request file failed')
      throw err
    }
  }

  async function cleanRequestFiles () {
    if (!this.tmpUploads) {
      return
    }
    for (let i = 0; i < this.tmpUploads.length; ++i) {
      const filepath = this.tmpUploads[i]
      try {
        await unlink(filepath)
      } /* c8 ignore start */ catch (error) {
        this.log.error(error, 'Could not delete file')
      }
      /* c8 ignore stop */
    }
  }

  async function getMultipartFile (options) {
    const parts = this[kMultipartHandler](options)
    let part
    while ((part = await parts()) != null) {
      /* Only return a part if the file property exists */
      if (part.file) {
        return part
      }
    }
  }

  async function * getMultipartFiles (options) {
    const parts = this[kMultipartHandler](options)

    let part
    while ((part = await parts()) != null) {
      if (part.file) {
        yield part
      }
    }
  }

  async function * getMultipartIterator (options) {
    const parts = this[kMultipartHandler](options)

    let part
    while ((part = await parts()) != null) {
      yield part
    }
  }

  done()
}

/**
 * Adds a new type `isFile` to help @fastify/swagger generate the correct schema.
 */
function ajvFilePlugin (ajv) {
  return ajv.addKeyword({
    keyword: 'isFile',
    compile: (_schema, parent) => {
      // Updates the schema to match the file type
      parent.type = 'string'
      parent.format = 'binary'
      delete parent.isFile

      return (field /* MultipartFile */) => !!field.file
    },
    error: {
      message: 'should be a file'
    }
  })
}

/**
 * These export configurations enable JS and TS developers
 * to consumer fastify in whatever way best suits their needs.
 */
module.exports = fp(fastifyMultipart, {
  fastify: '5.x',
  name: '@fastify/multipart'
})
module.exports["default"] = fastifyMultipart
module.exports.fastifyMultipart = fastifyMultipart
module.exports.ajvFilePlugin = ajvFilePlugin


/***/ }),

/***/ 92710:
/***/ ((module) => {



const HEX = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f',
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f',
  '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f',
  'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af',
  'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf',
  'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf',
  'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df',
  'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef',
  'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff'
]

const random = Math.random

function seed () {
  return (
    HEX[0xff * random() | 0] +
    HEX[0xff * random() | 0] +
    HEX[0xff * random() | 0] +
    HEX[0xff * random() | 0] +
    HEX[0xff * random() | 0] +
    HEX[0xff * random() | 0] +
    HEX[0xff * random() | 0]
  )
}

module.exports.generateId = (function generateIdFn () {
  let num = 0
  let str = seed()
  return function generateId () {
    return (num === 255) // eslint-disable-line no-return-assign
      ? (str = seed()) + HEX[num = 0]
      : str + HEX[++num]
  }
})()


/***/ }),

/***/ 88665:
/***/ ((module) => {



module.exports = function streamToNull (stream) {
  return new Promise((resolve, reject) => {
    stream.on('data', () => {
      /* The stream needs a data reader or else it will never end. */
    })
    stream.on('close', () => {
      resolve()
    })
    stream.on('end', () => {
      resolve()
    })
    stream.on('error', (error) => {
      reject(error)
    })
  })
}


/***/ })

};
;