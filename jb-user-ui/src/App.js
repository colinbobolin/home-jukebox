import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import './index.css';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Login from './Login'
import Callback from './Callback'
import Browse from './Browse'
import Admin from './Admin'
import { checkAuth } from './auth'

function AuthRoute({ component: Component, ...rest }) {
    return (
        <Route {...rest} render={props => (
            checkAuth() ?
                <Component {...props} />
                : <Redirect to={{ pathname: "/login" }} />
        )} />
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/login" render={props => <Login {...props} />} />
                <Route path="/callback" render={props => <Callback {...props} />} />
                <AuthRoute path="/admin" component={props => <Admin {...props} />} />
                <AuthRoute exact path="/" component={props => <Browse {...props} />} />
            </Switch>
        </BrowserRouter>
    )
}