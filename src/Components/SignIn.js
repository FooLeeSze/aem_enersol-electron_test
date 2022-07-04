import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/signin.css'


export default function SignIn() {

    // Login API Url
    const loginApiUrl = 'http://test-demo.aemenersol.com/api/account/login';

    // Initialize user credentials
    const [userCred, setUserCred] = useState({
        username: '',
        password: ''
    })

    // Initialize display overlay
    const [overlay, setOverlay] = useState({display: false, dispText: ''})

    const navigate = useNavigate();

    
    function handleChange(event) {
        // Set user credentials upon input changes
        setUserCred(prevCred => {
            return {
                ...prevCred,
                [event.target.id]: event.target.value
            }
        })
    }

    function fetchToken(url, cred) {
        // Set overlay to display 'Signing in...'
        setOverlay({display: true, dispText: 'Signing in...'})

        // Fetch token
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(cred),
            headers: {
                "Content-type": "application/json"
            }
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            return Promise.reject(response)

        }).then(token => {
            // If successful login, store token and navigate to dashboard\
            sessionStorage.setItem('accessToken', token)
            navigate('/dashboard')

        }).catch(response => {
            // If not successful, display failed and prompt to try again
            console.log(response.status, response.statusText)
            setOverlay({display: true, dispText: 'Sign in failed. Please try again.'})
            setTimeout(() => {
                setOverlay({display: false, dispText: ''})
            }, 2000)
        })
    }


    function handleSubmit(event) {
        event.preventDefault()

        // Fetch token upon user submitting credentials
        fetchToken(loginApiUrl, userCred);
    }

    return (
        <div id="sign-in">
            <form id="sign-in-form" onSubmit={handleSubmit}>
                {/* Display overlay when signing in and when login failed */
                    overlay.display && 
                    <div id="sign-in-overlay">
                        <span>{overlay.dispText}</span>
                    </div>
                }
                <div className="form-group" id="form-title-container">
                    <h2 className="form-title">Sign in to your dashboard</h2>
                </div>
                <div className="form-group" id="input-container">
                    <input name="username" id="username" className="user-input" placeholder='Username' required onChange={handleChange} />
                    <input type="password" name="password" id="password" className="user-input" placeholder='Password' required onChange={handleChange} />
                    <input type="submit" id="submit-btn" value="SIGN IN" onSubmit={handleSubmit} />
                </div>
            </form>
        </div>
    )
}