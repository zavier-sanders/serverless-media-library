import PropTypes from 'prop-types'
import {handleSignOut, getCurrentUser, getUser } from '../auth/auth'
import React, { Component } from 'react'
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Table,
  Label,
  Input,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
} from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import PeopleTable from './peopleTable'
import ProfileLink from '../profile/profileLink'
import { getUserInfo } from '../utility/users';

import './people.css';


/* eslint-disable react/no-multi-comp */
/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */
const HomepageHeading = ({ mobile }) => (

  <Container text>
    <Header
      as='h1'
      content='Easy Image Finder'
      inverted
      style={{
        fontSize: mobile ? '2em' : '4em',
        fontWeight: 'normal',
        marginBottom: 0,
        marginTop: mobile ? '1.5em' : '3em',
      }}
    />
    <Header
      as='h2'
      content='Deep learning-based image storage'
      inverted
      style={{
        fontSize: mobile ? '1.5em' : '1.7em',
        fontWeight: 'normal',
        marginTop: mobile ? '0.5em' : '1.5em',
      }}
    />
    <Button primary size='huge'>
      Get Started
      <Icon name='right arrow' />
    </Button>
  </Container>
)

HomepageHeading.propTypes = {
  mobile: PropTypes.bool,
}

/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup.
 */
class DesktopContainer extends Component {
  constructor() {
    super();
    
  }
  state = {}

  hideFixedMenu = () => this.setState({ fixed: false })
  showFixedMenu = () => this.setState({ fixed: true })

  handleSignOutClick = () => {
    handleSignOut()
  }
  
  // handleSignInClick = () => {
  //   this.context.history.push('/login')
  // }
  
  handleSignUpClick = () => {
    this.props.history.push('/register')
  }

  render() {
    const { children, user } = this.props
    const { fixed } = this.state

    return (
      <Responsive {...Responsive.onlyComputer}>
        <Visibility once={false} onBottomPassed={this.showFixedMenu} onBottomPassedReverse={this.hideFixedMenu}>
          <Segment inverted textAlign='center' vertical>
            <Menu
              fixed={fixed ? 'top' : null}
              inverted={!fixed}
              // pointing={!fixed}
              secondary={!fixed}
              size='large'
            >
              <Container>
                <Menu.Item as='a'><Link to='/'>
                {!fixed ? 
                  <img style={{width: '120px'}} src='/logo-v2.png' />
                  :
                  <img style={{width: '120px'}} src='/logo-v2.png' />
                }
                  
                </Link></Menu.Item>
                <Menu.Item as='a' ><Link to='/'>Home</Link></Menu.Item>
                <Menu.Item as='a' ><Link to='/collections'>Collections</Link></Menu.Item>
                {user ? <Menu.Item as='a'><Link to={{ 
                          pathname: '/search', 
                          state: { user: user }}}>Search</Link></Menu.Item>
                : ''}
                  
                  {user ? 
                    <Menu.Menu position='right'>
                      <Menu.Item as='a'><Link to="/company/members">People</Link></Menu.Item>
                      <Menu.Item position='right'>
                        <ProfileLink/>
                      </Menu.Item>
                    </Menu.Menu>
                  : 
                    <Menu.Menu position='right'>
                      <Menu.Item position='right'>
                        <Link to="/login"><Button as='a' inverted={!fixed} >Log in</Button></Link>
                        <Link to="/register"><Button as='a' inverted={!fixed} primary={fixed} style={{ marginLeft: '0.5em' }}>Sign Up</Button></Link>
                      </Menu.Item>
                    </Menu.Menu>
                  }
              </Container>
            </Menu>
          </Segment>
        </Visibility>

        {children}
      </Responsive>
    )
  }
}

DesktopContainer.propTypes = {
  children: PropTypes.node,
}

class MobileContainer extends Component {
  state = {}

  handleToggle = () => this.setState({ sidebarOpened: !this.state.sidebarOpened })

  render() {
    const { children, user } = this.props
    const { sidebarOpened } = this.state

    return (
      <Responsive {...Responsive.onlyMobile}>
        <Sidebar.Pushable>
          <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
            <Link to='/'><Menu.Item as='a'>Home</Menu.Item></Link>
            <Link to='/collections'><Menu.Item as='a' active>Collections</Menu.Item></Link>
            <Link to={{ 
                        pathname: '/search', 
                        state: { user: user }}}><Menu.Item as='a'>Search</Menu.Item></Link>
            <Link to='/'><Menu.Item as='a'onClick={this.handleSignOutClick}>Log Out</Menu.Item></Link>
          </Sidebar>

          <Sidebar.Pusher dimmed={sidebarOpened} onClick={this.handleToggle} style={{ minHeight: '100vh' }}>
            <Segment inverted textAlign='center' style={{ minHeight: 350, padding: '1em 0em' }} vertical>
              <Container>
                <Menu inverted pointing secondary size='large'>
                  <Menu.Item onClick={this.handleToggle}>
                    <Icon name='sidebar' />
                  </Menu.Item>
                  <Menu.Item position='right'>
                    <Button as='a' inverted>Log in</Button>
                    <Button as='a' inverted style={{ marginLeft: '0.5em' }}>Sign Up</Button>
                  </Menu.Item>
                </Menu>
              </Container>
              {/* <HomepageHeading mobile /> */}
            </Segment>

            {children}
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </Responsive>
    )
  }
}

MobileContainer.propTypes = {
  children: PropTypes.node,
}

const ResponsiveContainer = ({ children, user }) => (
  <div>
    <DesktopContainer user={user}>{children}</DesktopContainer>
    <MobileContainer user={user}>{children}</MobileContainer>
  </div>
)

ResponsiveContainer.propTypes = {
  children: PropTypes.node,
}

class PeoplePage extends Component {
  constructor() {
    super();
    
    this.state = {
      user: {},
    }

    this.checkStatus();

  }

  componentWillMount() {
      // console.log(this);
      getCurrentUser( (err, user) => {
        if (!err) {
          this.setState({user})
        };
      });
      
  }

  checkStatus() {
    let user = getUser();
    
    getUserInfo(user.email)
    .then((data) => {
      let status = data.currentStatus;

      if (status == 'disabled') {
        this.props.history.push('/disabled');
      } else if (status == 'active') {
        return 
      }
    });
  }

  render() {

    return (
      <ResponsiveContainer user={this.state.user}>
        <PeopleTable />
      </ResponsiveContainer>
    )
  }
}
export default withRouter(PeoplePage)
