export const getToken = () => {
    const token = window.localStorage.getItem('tokenInfo');
    var parsed = JSON.parse(token);
    return parsed;
}

export const deleteToken = () => {
    window.localStorage.removeItem('tokenInfo');
}

export const checkAuth = () => {
    const token = getToken();
    if (!token) {
        //alert('token not found')
        console.log('token not found')
        return false;
    }

    //check if token is expired
    try {
        const now = new Date().getTime();
        console.log('token expires ' + token.exp)
        console.log('current time: ' + now)
        if (token.exp < new Date().getTime()) {
            //alert('token is expired')
            console.log('token is expired')
            return false;
        }
    }
    catch (error) {
        //alert('error decoding token')
        return false;
    }

    //alert('token found!')
    console.log('token found!')
    return true
}