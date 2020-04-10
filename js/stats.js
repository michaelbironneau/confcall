let lastResult;

window.setInterval(() => {
    if (!pc1) {
      return;
    }
    const sender = pc1.getSenders()[0];
    if (!sender) {
      return;
    }
    sender.getStats().then(res => {
      res.forEach(report => {
        let bytes;
        let headerBytes;
        let packets;
        if (report.type === 'outbound-rtp') {
          if (report.isRemote) {
            return;
          }
          const now = report.timestamp;
          bytes = report.bytesSent;
          headerBytes = report.headerBytesSent;
  
          packets = report.packetsSent;
          if (lastResult && lastResult.has(report.id)) {
            // calculate bitrate
            const bitrate = 8 * (bytes - lastResult.get(report.id).bytesSent) /
              (now - lastResult.get(report.id).timestamp);
            const headerrate = 8 * (headerBytes - lastResult.get(report.id).headerBytesSent) /
              (now - lastResult.get(report.id).timestamp);
            
            const reportEl = document.getElementById('bitrate');
            reportEl.innerText = bitrate.toFixed(0) + " kbps";
          }
        }
      });
      lastResult = res;
    });
  }, 1000);