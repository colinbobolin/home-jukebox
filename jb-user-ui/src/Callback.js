import React from 'react';
import { Redirect } from 'react-router-dom'
import { getHash } from './getHash'

export default function Callback() {
    const accessToken = getHash().access_token
    console.log(accessToken)
    var expire = new Date()
    expire = expire.setHours(expire.getHours() + 1)
    const tokenDetails = { 'accessToken': accessToken, 'exp': expire }
    window.localStorage.setItem('tokenInfo', JSON.stringify(tokenDetails))

    // var testDetails = JSON.parse(window.localStorage.getItem('tokenInfo'));
    // var token = testDetails.accessToken
    // var expires = new Date(testDetails.exp)
    // var timeToExpire = expires.getTime() - new Date().getTime()
    // return (
    //     <div>
    //         <p>your access token is {token}</p>
    //         <p>it will expire at {expires.getTime()} ({timeToExpire} from now)</p>
    //         <a href='/'>Browse</a>
    //     </div>
    // )
    return <Redirect to="/" />
}