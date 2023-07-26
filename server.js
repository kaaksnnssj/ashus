const express = require('express');
const gamedig = require('gamedig');
const fivem = require('discord-fivem-api');
const query = require('samp-query')
const portscanner = require('portscanner');
const app = express();
const port = 8080;

app.get('/api/ping', function (req, res) {
    const ip = req.query.ip;
    const port = req.query.port;
    gamedig.query({
    type: 'samp',
    host: ip,
    port: port
}).then((state) => {
    res.json({'response': {'ping': state['ping']}});
}).catch((error) => {
    res.json({'error': 'Something Went Wrong Please Check IP And Port Correctly or Please Try Again Later'});
});
})

app.get('/api/scan', function (req, res) {
    const ip = req.query.ip;
    const port = req.query.port;
    portscanner.checkPortStatus(port, ip, function(error, status) {
    console.log(status)
    res.json({'response': {status}})
    })
    })

app.get('/api/samp', function (req, res) {
  const ip = req.query.ip;
  const port = req.query.port;
  const serverip = `${ip}:${port}`;
  const options = {
    host: ip,
    port: port
  };
  query(options, function (error, response) {
    if (error) {
      res.status(404).json({'error': 'Something Went Wrong Please Check IP And Port Correctly or Please Try Again Later'})
    } else {
      function createStrList(arr) {
        const indexLen = Math.floor(Math.log10(arr.length - 1)) + 1;
        let nameLen = 0;
        let scoreLen = 0;
        let pingLen = 0;

        for (const item of arr) {
          if (item.name.length > nameLen) nameLen = item.name.length;
          if (item.score.toString().length > scoreLen) scoreLen = item.score.toString().length;
          if (item.ping.toString().length > pingLen) pingLen = item.ping.toString().length;
        }

        return arr.map((x, i) => {
          const indexStr = `${i}`.padStart(indexLen, ' ');
          const nameStr = x.name.padEnd(nameLen, ' ');
          const scoreStr = x.score.toString().padEnd(scoreLen, ' ');
          const pingStr = x.ping.toString().padEnd(pingLen, ' ');
          return `${indexStr} ${nameStr} ${scoreStr} ${pingStr}`;
        }).slice(0, 11).join('\n');
      }

      const playersList = createStrList(response['players']);
      const responseJson = {
        'response': {
          'serverip': serverip,
          'address': response['address'],
          'hostname': response['hostname'],
          'gamemode': response['gamemode'],
          'language': response['mapname'] || '-',
          'passworded': response['passworded'],
          'maxplayers': response['maxplayers'],
          'isPlayerOnline': response['online'],
          'rule': {
            'lagcomp': response['rules'].lagcomp,
            'mapname': response['rules'].mapname,
            'version': response['rules'].version,
            'weather': response['rules'].weather,
            'weburl': response['rules'].weburl,
            'worldtime': response['rules'].worldtime
          },
          'isPlayersIngame': playersList
        }
      };
      res.json(responseJson);
    }
  });
});

app.get('/api/player', function (req, res) {
    const ip = req.query.ip;
    const port = req.query.port;
    const serverip = `${ip}:${port}`;
    const options = {
        host: ip,
        port: port
    };
    query(options, function (error, response) {
        if (error) {
            res.status(404).json({'error': 'Something Went Wrong Please Check IP And Port Correctly or Please Try Again Later'})
        } else {
            function createStrList(arr) {
                const indexLen = Math.floor(Math.log10(arr.length - 1)) + 1;
                let nameLen = 0;
                let scoreLen = 0;
                let pingLen = 0;

                for (const item of arr) {
                    if (item.name.length > nameLen) nameLen = item.name.length;
                    if (item.score.toString().length > scoreLen) scoreLen = item.score.toString().length;
                    if (item.ping.toString().length > pingLen) pingLen = item.ping.toString().length;
                }

                return arr.map((x, i) => {
                    const indexStr = `${i}`.padStart(indexLen, ' ');
                    const nameStr = x.name.padEnd(nameLen, ' ');
                    const scoreStr = x.score.toString().padEnd(scoreLen, ' ');
                    const pingStr = x.ping.toString().padEnd(pingLen, ' ');
                    return `${indexStr} ${nameStr} ${scoreStr} ${pingStr}`;
                }).slice(0, 31).join('\n');
            }

            const playersList = createStrList(response['players']);
            const responseJson = {
                'response': {
                    'hostname': response['hostname'] || '-',
                    'maxplayers': response['maxplayers'] || '-',
                    'isPlayerOnline': response['online'],
                    'isPlayersIngame': playersList || 'Players 100 and above cannot be displayed'
                }
            };
            res.json(responseJson);
        }
    });
});

app.get('/api/fivemp', function (req, res) {
  const ip = req.query.ip;
  const port = req.query.port;
  const serverip = `${ip}:${port}`;
  const options = {
    type: 'fivem',
    host: ip,
    port: port
  };

  const server = new fivem.DiscordFivemApi(serverip);

  server.getPlayers()
    .then((players) => {
      const formattedPlayers = players.slice(0, 11).map((player, index) => {       
      const playerNumber = index.toString().padEnd(2);
      const formattedName = player.name.padEnd(14);
      const formattedID = player.id.toString().padEnd(5);
      const formattedPing = player.ping.toString().padEnd(4);
      return `${playerNumber} ${formattedName} ${formattedID} ${formattedPing}`;
      }).join('\n');

      gamedig.query(options)
        .then((response) => {
          const responseJson = {
            'response': {
              'serverip': serverip,
              'hostname': response['name'] || '-',
              'map': response['map'] || '-',
              'ping': response['ping'] || '-',
              'players': response['players'].length || 0,
              'maxplayers': response['maxplayers'] || '-',
              'isPlayersIngame': formattedPlayers
            }
          };
          res.json(responseJson);
        })
        .catch((error) => {
          console.error(error);
          res.status(404).json({ 'error': 'Something Went Wrong. Please Check IP And Port Correctly or Try Again Later' });
        });
    })
    .catch((error) => {
      console.error("Error fetching player data:", error);
      res.status(404).json({ 'error': 'Something Went Wrong. Please Check IP And Port Correctly or Try Again Later' });
    });
});

app.get('/api/fivem', function (req, res) {
    const ip = req.query.ip;
    const port = req.query.port;
    const serverip = `${ip}:${port}`;
    const options = {
        type: 'fivem',
        host: ip,
        port: port
    };

    gamedig.query(options)
        .then((response) => {
            const playersList = response.players.map((player) => player.name).slice(0, 11).join('\n');
            const responseJson = {
                'response': {
                    'serverip': serverip,
                    'hostname': response['name'] || '-',
                    'map': response['map'] || '-',
                    'ping': response['ping'] || '-',
                    'players': response['players'].length || 0,
                    'maxplayers': response['maxplayers'] || '-',
                    'isPlayersIngame': playersList
                }
            };
            res.json(responseJson);
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json({'error': 'Something Went Wrong. Please Check IP And Port Correctly or Try Again Later'});
        });
});

app.get('/api/minecraft', function (req, res) {
  const ip = req.query.ip;
  const port = req.query.port;
  const serverip = `${ip}:${port}`;
  const options = {
    type: 'minecraft',
    host: ip,
    port: port
  };

  gamedig.query(options)
    .then((response) => {
      const playersList = response.players.map((player) => player.name).slice(0, 11).join('\n');
      const responseJson = {
        'response': {
          'serverip': serverip,
          'hostname': response['name'],
          'players': response['players'].length,
          'maxplayers': response['maxplayers'],
          'isPlayersIngame': playersList
        }
      };
      res.json(responseJson);
    })
    .catch((error) => {
      console.error(error);
      res.status(404).json({ 'error': 'Something Went Wrong. Please Check IP And Port Correctly or Try Again Later' });
    });
});

app.get('*', function(req, res){
  res.status(404).json({ '404': 'Not Found! Enter IP AND PORT', 'Example': '/api/samp?ip={ip}&port={port}', 'Author': 'Xalbador' });
});

app.listen(port, () => console.log(`listening at port ${port}`));
