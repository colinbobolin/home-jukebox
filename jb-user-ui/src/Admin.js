import { useState, React } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import axios from 'axios'

async function validateCredentials(username, password) {
    let endpoint = 'http://localhost:8008/authenticate'
    let headers = {
        'Authorization': `Basic ${username}:${password}`
    }

    return await axios.post(endpoint, null, { headers });
}

async function sendLogout() {
    let endpoint = 'http://localhost:8008/logout';
    return await axios.post(endpoint);
}

export default function Admin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')

    const handleLogin = (event) => {
        event.preventDefault();
        setError('');
        validateCredentials(username, password)
            .then((response) => {
                console.log(response)
                if (response.status === 200) {
                    console.log('credentials valid')
                    window.location = 'http://localhost:8008/login'
                }
                else {
                    setError('Invalid Credentials');
                }
            }, (error) => { console.log(error); setError('Invalid Credentials') })
    }

    const handleLogout = (event) => {
        event.preventDefault();
        setError('');
        validateCredentials(username, password)
            .then((response) => {
                if (response.status === 200) {
                    sendLogout();
                    window.location = 'http://localhost:3000/'
                } else {
                    setError('Invalid Credentials');
                }
            }, (error) => { console.log(error); setError('Invalid Credentials') })
    }

    return (
        <div className="App">
            <header className="Admin-header">
                <h1>Jukebox Controls</h1>
                <div className='Admin-element'>
                    <TextField variant="filled" color='primary' onChange={(event) => setUsername(event.target.value)} placeholder='username' />
                </div>
                <div className='Admin-element'>
                    <TextField variant="filled" color='primary' type='password' onChange={(event) => setPassword(event.target.value)} placeholder='password' />
                </div>
                <div className='Admin-element'>
                    <Button onClick={handleLogin} variant="contained" color="primary">
                        Start
                    </Button>
                    &nbsp;
                    <Button onClick={handleLogout} variant="contained" color="secondary">
                        Stop
                    </Button>
                </div>
                <h6>{error}</h6>
            </header>
        </div >
    )
}