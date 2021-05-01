const express = require('express')
require('dotenv').config('../.env')
const app = express();
const axios = require('axios').default;
const querystring = require('querystring');
const cors = require('cors');
const open = require('open');

app.use(express.json());

let clientUri = process.env.CLIENT_URI
console.log(clientUri)
app.use(cors());

const OFF = 'Offline';
const ON = 'Online';
let jukebox_status = OFF;

let access_token = '';
let refresh_token = '';

app.get('request', function (req, res) {
  refresh().then(
    (response) => {
      res.send(response);
    }, (error) => {
      res.send(error);
    }
  )
})

const refresh = () => {
  var endpoint = 'https://accounts.spotify.com/api/token'

  var config = {
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  axios.post(endpoint, null, config)
    .then((response) => {
      access_token = response.data.access_token;
      refresh_token = response.data.refresh_token;
      jukebox_status = ON;
      console.log(response.data.access_token);
      return response;
    }, (error) => {
      console.log(error);
      return error;
    });
}

app.get('/status', (req, res) => {
  console.log('status requested: ' + jukebox_status)
  res.send({ jukebox_status });
})

// Receive requests
app.post("/request", (req, res) => {
  if (jukebox_status === OFF) {
    res.status(403).send('Jukebox is currently OFF');
  }
  let data = req.body;
  console.log(data);
  let track_id = data.track_id;
  let request_timestamp = data.request_timestamp;
  console.log(`REQUEST RECEIVED: \n\ttrack_id: ${track_id}\n\trequest_timestamp: ${request_timestamp}`)

  //https://developer.spotify.com/documentation/web-api/reference/#endpoint-add-to-queue
  const options = {
    headers: {
      'Authorization': 'Bearer ' + access_token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    params: {
      uri: `spotify:track:${track_id}`
    }
  }

  let endpoint = 'https://api.spotify.com/v1/me/player/queue'
  axios.post(endpoint,
    null,
    options
  ).then((response) => {
    console.log(response);
    res.status(204).send(data)
  }, (error) => {
    console.log(error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data)
    }
  });
});

//get currently playing
app.get('/current', (req, res) => {
  if (jukebox_status === OFF) {
    res.sendStatus(403).send('Jukebox is currently offline');
  }

  var endpoint = 'https://api.spotify.com/v1/me/player/currently-playing?' +
    querystring.stringify({ "market": "from_token" });

  var config = {
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  }
  axios.get(endpoint, config)
    .then((response) => {
      console.log(response);
      res.send(response.data)
    });

});

let port = process.env.PORT || 8008;

app.post('/authenticate', function (req, res) {
  console.log(req.headers.authorization)
  console.log(req.headers.authorization == process.env.JUKEBOX_KEY)
  if (req.headers.authorization == process.env.JUKEBOX_KEY) {
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
})

app.get('/login', function (req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email user-read-playback-state user-modify-playback-state',
      redirect_uri: process.env.REDIRECT_URI || `http://localhost:${port}/callback`,
      show_dialog: true
    }))
});

app.get('/callback', function (req, res) {
  let code = req.query.code || null

  const headers = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: process.env.SPOTIFY_CLIENT_ID,
      password: process.env.SPOTIFY_CLIENT_SECRET,
    },
  };
  const data = {
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.REDIRECT_URI || `http://localhost:${port}/callback`,
  };

  axios.post(
    'https://accounts.spotify.com/api/token',
    querystring.stringify(data),
    headers
  ).then((response) => {
    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    jukebox_status = ON;
    console.log(response.data.access_token);
    res.redirect(process.env.CLIENT_URI)
  }, (error) => {
    console.log(error);
  });
});

app.post('/logout', (req, res) => {
  jukebox_status = OFF;
  access_token = '';
  refresh_token = '';
  res.sendStatus(200);
});

let server = app.listen(port, function () {
  console.log(`App listening on port ${port}`);
});

// open('https://accounts.spotify.com/authorize?' +
//   querystring.stringify({
//     response_type: 'code',
//     client_id: process.env.SPOTIFY_CLIENT_ID,
//     scope: 'user-read-private user-read-email user-read-playback-state user-modify-playback-state',
//     redirect_uri: process.env.REDIRECT_URI || `http://localhost:${port}/callback`,
//     show_dialog: true
//   }));

module.exports = server;