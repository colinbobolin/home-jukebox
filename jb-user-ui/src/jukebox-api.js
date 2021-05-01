import config from './config.json';
import axios from 'axios';
import { getToken } from './auth'

export const getJukeboxStatus = async () => {
    var endpoint = config.JUKEBOX_SERVER_URI + "/status";

    try {
        var response = await (axios.get(endpoint));
        return response;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const getNewReleases = () => {
    var tokenInfo = getToken();
    var token = tokenInfo.accessToken;
    var endpoint = 'https://api.spotify.com/v1/browse/new-releases/'

    var config = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }

    axios.get(endpoint, config)
        .then(
            (response) => {
                console.log(response)
                return response.data.albums.items
            },
            (error) => {
                console.log(error)
                return null
            }
        )
}

export const getLikedTracks = async () => {
    var tokenInfo = getToken();
    var token = tokenInfo.accessToken;
    const endpoint = 'https://api.spotify.com/v1/me/top/tracks'

    var config = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }

    try {
        let response = await axios.get(endpoint, config)
        return response.data
    }
    catch (e) {
        console.log(e);
    }

}

export const getCurrentlyPlaying = async () => {
    var endpoint = config.JUKEBOX_SERVER_URI + "/current";

    try {
        var response = await (axios.get(endpoint));
        return response;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const getTrackSearchResults = async (query) => {
    var tokenInfo = getToken();
    var token = tokenInfo.accessToken;
    var endpoint = `https://api.spotify.com/v1/search/?q=${query}&type=track`
    var config = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }

    try {
        var response = await axios.get(endpoint, config)
        console.log(response);
        return response;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

export const postRequest = async (id) => {
    var endpoint = config.JUKEBOX_SERVER_URI + '/request'

    var request = {
        track_id: id,
        request_timestamp: Date.now()
    }

    try {
        await axios.post(endpoint, request)
            .then((response) => {
                if (response.status === 204) {
                    alert("added your track to the queue!")
                }
                else {
                    console.log(response)
                }
            })
            .catch(err => {
                console.error(err);
            });
    } catch (e) {
        console.log(e);
    }
}