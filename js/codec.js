function setSdpDefaultVideoCodec(sdp, codec, preferHwCodec) {
    return setSdpDefaultCodec(sdp, 'video', codec, preferHwCodec);
  }
  
  /**
   * Returns a modified version of |sdp| where the |codec| has been promoted to be
   * the default codec, i.e. the codec whose ID is first in the list of codecs on
   * the 'm=|type|' line, where |type| is 'audio' or 'video'. If |preferHwCodec|
   * is true, it will select the last codec with the given name, and if false, it
   * will select the first codec with the given name, because HW codecs are listed
   * after SW codecs in the SDP list.
   * @private
   */
  function setSdpDefaultCodec(sdp, type, codec, preferHwCodec) {
    var sdpLines = splitSdpLines(sdp);
  
    // Find codec ID, e.g. 100 for 'VP8' if 'a=rtpmap:100 VP8/9000'.
    var codecId = findRtpmapId(sdpLines, codec, preferHwCodec);
    if (codecId === null) {
      throw new Failure('setSdpDefaultCodec',
              'Unknown ID for |codec| = \'' + codec + '\'.');
    }
  
    // Find 'm=|type|' line, e.g. 'm=video 9 UDP/TLS/RTP/SAVPF 100 101 107 116'.
    var mLineNo = findLine(sdpLines, 'm=' + type);
    if (mLineNo === null) {
      throw new Failure('setSdpDefaultCodec',
              '\'m=' + type + '\' line missing from |sdp|.');
    }
  
    // Modify video line to use the desired codec as the default.
    sdpLines[mLineNo] = setMLineDefaultCodec(sdpLines[mLineNo], codecId);
    return mergeSdpLines(sdpLines);
  }
  
  /**
   * Searches through all |sdpLines| for the 'a=rtpmap:' line for the codec of
   * the specified name, returning its ID as an int if found, or null otherwise.
   * |codec| is the case-sensitive name of the codec. If |lastInstance|
   * is true, it will return the last such ID, and if false, it will return the
   * first such ID.
   * For example, if |sdpLines| contains 'a=rtpmap:100 VP8/9000' and |codec| is
   * 'VP8', this function returns 100.
   * @private
   */
  function findRtpmapId(sdpLines, codec, lastInstance) {
    var lineNo = findRtpmapLine(sdpLines, codec, lastInstance);
    if (lineNo === null) {
      return null;
    }
    // Parse <id> from 'a=rtpmap:<id> <codec>/<rate>'.
    var id = sdpLines[lineNo].substring(9, sdpLines[lineNo].indexOf(' '));
    return parseInt(id);
  }
  
  /**
   * Finds a 'a=rtpmap:' line from |sdpLines| that contains |contains| and returns
   * its line index, or null if no such line was found. |contains| may be the
   * codec ID, codec name or bitrate. If |lastInstance| is true, it will return
   * the last such line index, and if false, it will return the first such line
   * index.
   * An 'a=rtpmap:' line looks like this: 'a=rtpmap:<id> <codec>/<rate>'.
   */
  function findRtpmapLine(sdpLines, contains, lastInstance) {
    if (lastInstance === true) {
      for (var i = sdpLines.length - 1; i >= 0 ; i--) {
        if (isRtpmapLine(sdpLines[i], contains)) {
          return i;
        }
      }
    } else {
      for (i = 0; i < sdpLines.length; i++) {
        if (isRtpmapLine(sdpLines[i], contains)) {
          return i;
        }
      }
    }
    return null;
  }
  
  /**
   * Returns true if |sdpLine| contains |contains| and is of pattern
   * 'a=rtpmap:<id> <codec>/<rate>'.
   */
  function isRtpmapLine(sdpLine, contains) {
    // Is 'a=rtpmap:' line containing |contains| string?
    if (sdpLine.startsWith('a=rtpmap:') &&
        sdpLine.indexOf(contains) !== -1) {
      // Expecting pattern 'a=rtpmap:<id> <codec>/<rate>'.
      var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
      if (!sdpLine.match(pattern)) {
        throw new Failure('isRtpmapLine', 'Unexpected "a=rtpmap:" pattern.');
      }
      return true;
    }
    return false;
  }
  
  /**
   * Returns a modified version of |mLine| that has |codecId| first in the list of
   * codec IDs. For example, setMLineDefaultCodec(
   *     'm=video 9 UDP/TLS/RTP/SAVPF 100 101 107 116 117 96', 107)
   * Returns:
   *     'm=video 9 UDP/TLS/RTP/SAVPF 107 100 101 116 117 96'
   * @private
   */
  function setMLineDefaultCodec(mLine, codecId) {
    var elements = mLine.split(' ');
  
    // Copy first three elements, codec order starts on fourth.
    var newLine = elements.slice(0, 3);
  
    // Put target |codecId| first and copy the rest.
    newLine.push(codecId);
    for (var i = 3; i < elements.length; i++) {
      if (elements[i] !== codecId) {
        newLine.push(elements[i]);
      }
    }
  
    return newLine.join(' ');
  }
  
  /** @private */
  function splitSdpLines(sdp) {
    return sdp.split('\r\n');
  }
  
  /** @private */
  function mergeSdpLines(sdpLines) {
    return sdpLines.join('\r\n');
  }
  
  /** @private */
  function findLine(lines, lineStartsWith, startingLine = 0) {
    for (var i = startingLine; i < lines.length; i++) {
      if (lines[i].startsWith(lineStartsWith)) {
        return i;
      }
    }
    return null;
  }
