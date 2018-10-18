/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

import React, { Component } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
import Collections from './collections'
import PublicHome from './public'
import Header from './header'
import Login from './auth/Login'
import Register from './auth/Register'
import Forget from './auth/Forget'
import Disabled from './auth/Disabled'
import CollectionPage from './collections/collectionPage';
import SearchPage from './search/searchPage';
import ProfilePage from './profile/profilePage';
import PeoplePage from './people/peoplePage';

import { checkUserAuthenticated, getUser } from './auth/auth'
import 'semantic-ui-css/semantic.css'

const PublicRoute = ({ component: Component, isAuthed, ...rest }) => (
  <Route
    {...rest}
    render={props => isAuthed ? (<Redirect to='/collections' />) : (<Component {...props} />)}
  />
)

const PrivateRoute = ({ component: Component, isAuthed, ...rest }) => (
  <Route
    {...rest}
    render={props => isAuthed ? (<Component {...props} />) : (<Redirect to='/login' />)}
  />
)

export default class AppRoute extends Component {
  render () {
    const isAuthed = checkUserAuthenticated()
    const user = getUser();
    console.log(`User authenticated: ${isAuthed}`)

    return (
      <div>
        {/* {isAuthed ? <Header /> : ''} */}
        <Switch>
          <Route exact path='/' component={PublicHome} />
          {/* <PublicRoute isAuthed={isAuthed} path='/' exact component={PublicHome} /> */}
          <PublicRoute isAuthed={isAuthed} path='/login' exact component={Login} />
          <PublicRoute isAuthed={isAuthed} path='/register' exact component={Register} />
          <PublicRoute isAuthed={isAuthed} path='/forget' exact component={Forget} />
          <PublicRoute isAuthed={isAuthed} path='/public' exact component={PublicHome} />
          
          <Route path='/disabled' exact component={Disabled} />

          <PrivateRoute isAuthed={isAuthed} path='/collections' exact component={Collections} />
          <PrivateRoute isAuthed={isAuthed} path='/collection/:folder' exact component={CollectionPage} />
          <PrivateRoute isAuthed={isAuthed} path='/search' exact component={SearchPage} />
          <PrivateRoute isAuthed={isAuthed} path='/account' exact component={ProfilePage} />
          <PrivateRoute isAuthed={isAuthed} path='/users' exact component={PeoplePage} />

          <Redirect to='/public' />)
        </Switch>
      </div>
    )
  }
}
