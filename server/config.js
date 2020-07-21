module.exports = {
  // General server settings
  server: {
    port: 8080,
    tls: {
      cert: '/etc/ssl/certs/ssl-cert-snakeoil.pem',
      key: '/etc/ssl/private/ssl-cert-snakeoil.key'
    },
    tlsVM: {
      cert: '/home/nico/www.spatialmeetings.live.chained.crt',
      key: '/etc/ssl/www.spatialmeetings.live.key'
    }
  },
  meeting: {
    // General settings
    keepRoomAlive: true,
    // Router settings
    router: {
      mediaCodecs:
        [
          {
            kind      : 'audio',
            mimeType  : 'audio/opus',
            clockRate : 48000,
            channels  : 2
          },
          {
            kind      : 'video',
            mimeType  : 'video/VP8',
            clockRate : 90000,
            parameters:
              {
                'x-google-start-bitrate': 1000
              }
          },
        ]
<<<<<<< be7fe00844678d21044e5b8aab0bf3b10965fa64
  },
=======
    },
>>>>>>> Adding Spatial sound...
    // Worker settings
    worker :
    {
      rtcMinPort : 40000,
      rtcMaxPort : 49999
    },
    // WebRtcTransport settings
    transport: {
        options: {
          listenIps: [
              {
                  ip          : '192.168.1.17',
                  announcedIp : null
              }
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true
        }
    },
    // WebSocket settings
    socket: {
      maxReceivedFrameSize      : 960000,
      maxReceivedMessageSize    : 960000,
      fragmentOutgoingMessages  : true,
      fragmentationThreshold    : 960000
    }
  },
  spatial: {
    // These files can be found here: https://github.com/Shawarma-ASSD/resources
    // hrir: '../resources/hrir/ari.json',
    hrir: './server/lib/spatial-server/resources/hrir/ari.json',
    brir: './server/lib/spatial-server/resources/brir/SBSBRIR00.json'
  }
};
