import faker from 'faker'
import React from 'react'
import { Dropdown, Image } from 'semantic-ui-react'
import { handleSignOut, getUser, checkUserAuthenticated } from '../auth/auth'
import { getUserInfo } from '../utility/users'
import { Link, withRouter, Redirect } from 'react-router-dom'

class ProfileLink extends React.Component {
  constructor() {
    super();

    this.state = {
      user: getUser(),
      picture: '',
      name: ''
    }

    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    let user = this.state.user;

    if (user) {
      getUserInfo(user.email)
      .then((data) => {
        this.setState({picture: data.picture, name: data.username})
        return data.picture;
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
    }
  }

  handleClick = (e, data) => {
    let selectedValue = data.value;

    if (selectedValue == 'log-out') { 
      this.props.history.push('/');
      return handleSignOut()
    } else if (selectedValue == 'account') {
      this.props.history.push('/account')
    }
  }

  render() {
    const userIsLoggedIn = checkUserAuthenticated()
    let picture = this.state.picture;
    let name = this.state.name;
    let user = this.state.user;

    const options = [
      { key: 'account', text: 'Account', icon: 'user', value: 'account' },
      // { key: 'settings', text: 'Settings', icon: 'settings' },
      { key: 'log-out', text: 'Log Out', icon: 'sign out', value: 'log-out' },
    ]

    const trigger = (
      <span>
        <Image avatar src={picture} /> {name}
      </span>
    )

    return (
      <div>
        {userIsLoggedIn && <Dropdown style={{zIndex: 1000}} onChange={this.handleClick} trigger={trigger} options={options} pointing='top left' icon={null} />}
      </div>
    )
  }
}

export default withRouter(ProfileLink)