import React from 'react'
import config from './config.json'
import querystring from 'query-string'
import Button from '@material-ui/core/Button'

export default function Login() {
    const handleClick = (event) => {
        var location = 'https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'token',
                client_id: config.SPOTIFY_CLIENT_ID,
                scope: 'user-read-private, user-top-read',
                redirect_uri: config.REDIRECT_URI,
                show_dialog: true
            })

        window.location = location;
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to Colin's Jukebox</h1>
                <Button onClick={handleClick} variant="contained" color="primary">
                    Log in with Spotify to continue
            </Button>
            </header>
        </div>
    )
}