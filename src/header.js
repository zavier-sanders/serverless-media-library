import React, { Component } from 'react'
import {handleSignOut, checkUserAuthenticated, getUser} from './auth/auth'
import { Button, Menu, Segment, Container } from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import { getUserInfo } from './utility/users'
import Moment from 'react-moment'
import { CONFIG } from './utility/config';

class Header extends Component {
  constructor() {
    super();

  }

  handleSignOutClick = () => {
    handleSignOut()
    this.props.history.push('/')
  }

  handleSignInClick = () => {
    this.props.history.push('/login')
  }


  render () {
    const userIsLoggedIn = checkUserAuthenticated()
    return (
      <div>
        {!userIsLoggedIn && ''}
      </div>
    )
  }
}

export default withRouter(Header)
