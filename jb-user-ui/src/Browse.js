import './App.css';
import React, { useState, useEffect, useRef } from 'react'
import { getCurrentlyPlaying, getJukeboxStatus, getLikedTracks, getTrackSearchResults, postRequest } from './jukebox-api'
import { getToken, deleteToken } from './auth'
import config from './config.json'
import { useRouteMatch, Link } from 'react-router-dom'

import { makeStyles, fade } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import axios from 'axios';
import { Redirect } from 'react-router';

const SERVER_URI = 'http://localhost:8008'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

function RequestButton(props) {
    let status = props.status
    let id = props.id

    const handleClick = (event) => {
        console.log(`Requesting: ${id}`)
        postRequest(id);
    }

    if (status === ONLINE) {
        return (<Button size="small" color="primary" onClick={handleClick}>
            Request
        </Button>)
    }
    else {
        return (<Button size="small" color="primary" disabled>
            Request
        </Button>)
    }
}

function TrackCard(props) {
    const id = props.id
    const name = props.name
    const album = props.album
    const artist = props.artist
    const img = props.img
    const status = props.status

    return (
        <Card className="track-card">
            <CardMedia
                component="img"
                height="140"
                alt={album}
                image={img}
                title={album}
            />
            <CardContent>
                <Typography gutterBottom variant="h6" component="h2">
                    {name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {album}
                    <br />
                    {artist}
                </Typography>
            </CardContent>
            <CardActions>
                <RequestButton id={id} status={status} />
            </CardActions>
        </Card >
    );
}

function DevelopmentDetails() {
    if (config.ENVIRONMENT === 'Test') {
        const tokenInfo = getToken();

        const tte = tokenInfo.exp - new Date().getTime();
        const minutes = new Date(tte).getMinutes();

        return (
            <div className="justified">
                <p>ENV: {config.ENVIRONMENT}</p>
                <p>TOK: {tokenInfo.accessToken}</p>
                <p>TTE: {minutes} minutes</p>
            </div>
        )
    }
}

function LikedTracks(props) {
    let status = props.status
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        async function getData() {
            await getLikedTracks()
                .then(data => {
                    setTracks(data.items)
                });
        }
        getData();

    }, [])

    if (tracks.length > 0) {
        return (
            <div className="section">
                <h2>Your Top Tracks</h2>
                <Grid container spacing={2} alignItems='stretch' justify='space-around'>
                    {tracks.map((track) => (
                        <Grid item>
                            <TrackCard
                                status={status}
                                id={track.id}
                                name={track.name}
                                album={track.album.name}
                                artist={track.artists[0].name}
                                img={track.album.images[0].url} />
                        </Grid>

                    ))}
                </Grid>

            </div>
        )
    }
    else {
        return (<></>)
    }
}

function SearchResults(props) {
    let tracks = props.tracks
    let query = props.query
    let status = props.status

    if (tracks.length > 0) {
        return (
            <div className="section">
                <h4>Search results for "{query}"</h4>
                <Grid container spacing={2} alignItems='stretch' justify='space-around'>
                    {tracks.map((track) => (
                        <Grid item>
                            <TrackCard
                                status={status}
                                id={track.id}
                                name={track.name}
                                album={track.album.name}
                                artist={track.artists[0].name}
                                img={track.album.images[0].url} />
                        </Grid>

                    ))}
                </Grid>
            </div>
        )
    }
    else {
        return <></>
    }
}

const OFFLINE = 'Offline'
const ONLINE = 'Online'

function Status(props) {
    let status = props.status

    if (status === ONLINE) {
        return (
            <p>Jukebox is Online. Search for and request a track to put it in the queue</p>
        )
    } else {
        return <p className='red-text'>Jukebox is currently Offline</p>
    }
}

function ServerLogin(props) {
    let match = useRouteMatch();
    const preventDefault = (event) => event.preventDefault();

    return (
        <Link to='/admin'>Admin</Link >)
}

export default function Browse(props) {
    const [tracks, setTracks] = useState([]);
    const [query, setQuery] = useState('');
    const [current, setCurrent] = useState('No playback');
    const [status, setStatus] = useState(OFFLINE);
    const classes = useStyles();

    useInterval(() => {
        async function getData() {
            await getJukeboxStatus()
                .then((response) => {
                    if (response) {
                        console.log(response);
                        setStatus(response.data.jukebox_status)
                    }
                    else {
                        setStatus("Offline")
                    }
                });
        }
        getData();
    }, config.REFRESH_TIMER);

    useInterval(() => {
        async function getData() {
            await getCurrentlyPlaying()
                .then((response) => {
                    if (response) {
                        console.log(response);
                        if (response.data.hasOwnProperty('item')) {
                            var isPlaying = response.data.is_playing ? '' : '(Paused)';
                            var trackName = response.data.item.name;
                            var artist = response.data.item.artists[0].name;
                            setCurrent(`${trackName} by ${artist} ${isPlaying}`)
                        } else {
                            setCurrent('No playback')
                        }
                    }
                    else {
                        setCurrent('No playback')
                    }
                })
        }
        if (status === 'Online') {
            getData();
        }
    }, config.REFRESH_TIMER);

    const handleChange = (event) => {
        setQuery(event.target.value);
    };

    const handleLogout = (event) => {
        deleteToken();
        window.location.reload();
    }

    const handleSearch = (event) => {
        event.preventDefault();
        async function getData() {
            await getTrackSearchResults(query)
                .then(response => {
                    if (response) {
                        console.log('SEARCH RESULTS:');
                        console.log(response);
                        setTracks(response.data.tracks.items)
                    }
                });
        }
        getData();
    }

    return (
        <div className="App">
            <header className="App-header">
                <div className={classes.root}>
                    <AppBar position="static">
                        <Toolbar>
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                                aria-label="open drawer"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography className={classes.title} variant="h6" noWrap>
                                Colin's Jukebox
                            </Typography>
                            <form onSubmit={handleSearch}>

                                <div className={classes.search}>
                                    <div className={classes.searchIcon}>
                                        <SearchIcon />
                                    </div>
                                    <InputBase
                                        onChange={handleChange}
                                        value={query}
                                        placeholder="Search…"
                                        classes={{
                                            root: classes.inputRoot,
                                            input: classes.inputInput,
                                        }}
                                        inputProps={{ 'aria-label': 'search' }}
                                    />
                                </div>
                            </form>
                            <Button color="inherit" onClick={handleLogout}>Logout</Button>
                        </Toolbar>
                    </AppBar>
                </div>
                <div className='title'>
                    <Typography variant="h2">
                        Welcome to Colin's Jukebox!
                    </Typography>
                </div>
                <Status status={status} />
                <p>
                    Currently playing: {current}
                </p>
                <Container>
                    <SearchResults tracks={tracks} query={query} status={status} />
                    <LikedTracks status={status} />
                    <ServerLogin />
                    {/* <DevelopmentDetails /> */}
                </Container>

            </header>

        </div>
    )
}