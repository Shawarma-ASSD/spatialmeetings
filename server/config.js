module.exports = {
  // General server settings
  server: {
    port: 8080,
    keepRoomAlive: true,
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
<<<<<<< 6457b639abaa5853ccc4118d5ed3e5d2fed26577
  },
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
              'x-google-start-bitrate': 1000
            }
        },
      ]
=======
>>>>>>> Added reference to impulse responses on config.js and added the large .JSON files to .gitignore
    },
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
                  ip          : '127.0.0.1',
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
    hrir: './lib/spatial-server/resources/hrir/ari.json',
    brir: './lib/spatial-server/resources/brir/SBSBRIR00.json'
  }
};