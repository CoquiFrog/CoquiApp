import React, { Component } from 'react';
import './Login.css';
import logo from './communityBank.svg';

export default class Login extends Component {
    render() {
        return (
            //(process.env.REACT_APP_LOGIN)
            <div className='App'>
                <img src={logo} alt='logo'/>
                <a className='hvr-pulse' href={process.env.REACT_APP_LOGIN}><button>Login</button></a>
        

            </div>
        )
    }

}