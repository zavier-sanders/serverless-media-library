import PropTypes from 'prop-types'
import {handleSignOut, getCurrentUser, checkUserAuthenticated} from './auth/auth'
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
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
} from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import ProfileLink from './profile/profileLink';

/* eslint-disable react/no-multi-comp */

const HomepageHeading = ({ mobile }) => (

  <Container text>
    <Header
      as='h1'
      content='Serverless Media Library'
      inverted
      style={{
        fontSize: mobile ? '2em' : '4em',
        fontWeight: 'normal',
        marginBottom: 0,
        marginTop: mobile ? '1.5em' : '2em',
      }}
    />
    <Header
      as='h2'
      content='AI powered digital asset management'
      inverted
      style={{
        fontSize: mobile ? '1.5em' : '1.7em',
        fontWeight: 'normal',
        marginTop: mobile ? '0.5em' : '1.5em',
        marginBottom: mobile ? '0.5em' : '1.5em',
      }}
    />
    <Link  to="/collections">
      <Button primary size='huge'>
        Get Started
        <Icon name='right arrow' />
      </Button>
    </Link>
  </Container>
)

HomepageHeading.propTypes = {
  mobile: PropTypes.bool,
}

class DesktopContainer extends Component {
  constructor() {
    super();

    this.state = {
      user: false
    }
    
  }
  

  hideFixedMenu = () => this.setState({ fixed: false })
  showFixedMenu = () => this.setState({ fixed: true })

  handleSignOutClick = () => {
    handleSignOut()
    this.forceUpdate();
  }
  
  
  handleSignUpClick = () => {
    this.props.history.push('/register')
  }

  componentWillMount() {
      getCurrentUser( (err, user) => {
        if (!err) {
          if (user) {
            this.setState({user})
          } else {
            this.setState({
              user: false
            })
          }
        };
      });
      
  }

  render() {
    const { children } = this.props
    const { fixed } = this.state
    let user = this.state.user;
    let imgUrl = 'https://static.pexels.com/photos/73871/rocket-launch-rocket-take-off-nasa-73871.jpeg';
    let styles = {
      minHeight: 700, 
      padding: '1em 0em',
      background: 'linear-gradient(rgba(20, 20, 20, 0.5), rgba(20, 20, 20, 0.5)), url(' + imgUrl + ') no-repeat top',
      backgroundSize: 'cover',
      overflow: 'hidden',
      };

    const userIsLoggedIn = checkUserAuthenticated()

    return (
      <Responsive {...Responsive.onlyComputer}>
        <Visibility once={false} onBottomPassed={this.showFixedMenu} onBottomPassedReverse={this.hideFixedMenu}>
          <Segment inverted textAlign='center' style={styles} vertical>
            <Menu
              fixed={fixed ? 'top' : null}
              inverted={!fixed}
              color='black'
              secondary={!fixed}
              size='large'
            >
              <Container>
              <Menu.Item as='a'><Link to='/'>
              {!fixed ? 
                <img style={{ paddingTop: '15px', width: '120px'}} src='/logo-v2.png' />
                :
                <img style={{ paddingTop: '15px', width: '120px'}} src='/logo-v2dark.png' />
              }
                
              </Link></Menu.Item>
              <Menu.Item as='a' active><Link to='/'>Home</Link></Menu.Item>
              <Menu.Item as='a' ><Link to='/collections'>Collections</Link></Menu.Item>
              {user ? <Menu.Item as='a'><Link to={{ 
                        pathname: '/search', 
                        state: { user: user }}}>Search</Link></Menu.Item>
              : ''}
                <Menu.Menu position='right'>
                    {/* {userIsLoggedIn && <Menu.Item as='a'><Link to="/company/members">People</Link></Menu.Item>} */}
                    {userIsLoggedIn ? 
                      <Menu.Item position='right'>
                        <ProfileLink/>
                      </Menu.Item>
                    :
                      <Menu.Item position='right'>  
                        <Link to="/login"><Button as='a' inverted={!fixed} >Log in</Button></Link>
                        <Link to="/register"><Button as='a' inverted={!fixed} primary={fixed} style={{ marginLeft: '0.5em' }}>Sign Up</Button></Link>
                      </Menu.Item>
                    }
                </Menu.Menu>
              </Container>
            </Menu>
            <HomepageHeading />
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
  constructor() {
    super();

    this.state = {
      user: false
    }
    
  }

  componentWillMount() {
      getCurrentUser( (err, user) => {
        if (!err) {
          if (user) {
            this.setState({user})
          } else {
            this.setState({
              user: false
            })
          }
        };
      });
      
  }

  handleToggle = () => this.setState({ sidebarOpened: !this.state.sidebarOpened })

  render() {
    const { children } = this.props
    const { sidebarOpened } = this.state
    let user = this.state.user;

    return (
      <Responsive {...Responsive.onlyMobile}>
        <Sidebar.Pushable>
          <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
          <Link to='/'><Menu.Item as='a' active>Home</Menu.Item></Link>
          <Link to='/collections'><Menu.Item as='a' >Collections</Menu.Item></Link>
          {user ? <Link to={{ 
                    pathname: '/search', 
                    state: { user: user }}}><Menu.Item as='a'>Search</Menu.Item></Link>
          : ''}
          {/* <Link target="_blank" to='/search'><Menu.Item as='a'>Search</Menu.Item></Link> */}
            
            {user ? 
              <Menu.Item position='right'>
                <Link to="/"><Button as='a' onClick={this.handleSignOutClick}>Log Out</Button></Link>
              </Menu.Item>
            : 
              <Menu.Item position='right'>
                <Link to="/login"><Button as='a' >Log in</Button></Link>
                <Link to="/register"><Button as='a' style={{ marginLeft: '0.5em' }}>Sign Up</Button></Link>
              </Menu.Item>
            }
          </Sidebar>

          <Sidebar.Pusher dimmed={sidebarOpened} onClick={this.handleToggle} style={{ minHeight: '100vh' }}>
            <Segment inverted textAlign='center' style={{ minHeight: 350, padding: '1em 0em' }} vertical>
              <Container>
                <Menu inverted pointing secondary size='large'>
                  <Menu.Item onClick={this.handleToggle}>
                    <Icon name='sidebar' />
                  </Menu.Item>
                  <Menu.Item position='right'>
                  {user ? 
                    <Menu.Item position='right'>
                      <Link to="/"><Button as='a' inverted onClick={this.handleSignOutClick}>Log Out</Button></Link>
                    </Menu.Item>
                  : 
                    <Menu.Item position='right'>
                      <Link to="/login"><Button inverted as='a' >Log in</Button></Link>
                      <Link to="/register"><Button inverted as='a' style={{ marginLeft: '0.5em' }}>Sign Up</Button></Link>
                    </Menu.Item>
                  }
                  </Menu.Item>
                </Menu>
              </Container>
              <HomepageHeading mobile />
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

const ResponsiveContainer = ({ children }) => (
  <div>
    <DesktopContainer>{children}</DesktopContainer>
    <MobileContainer>{children}</MobileContainer>
  </div>
)

ResponsiveContainer.propTypes = {
  children: PropTypes.node,
}

const HomepageLayout = () => (
  <ResponsiveContainer>
    <Segment style={{ padding: '3em 0em', paddingBottom: '8em' }} vertical>
      <Container text>
        <Divider
          as='h4'
          className='header'
          horizontal
          style={{ margin: '3em 0em', textTransform: 'uppercase' }}
        >
          <a href='/'>The Problem</a>
        </Divider>
        <Header textAlign='center' as='h3' style={{ fontSize: '2em' }}>Digital Asset Management</Header>
        <p style={{ fontSize: '1.33em', textAlign:'center' }}>
        If you're producing great content at a consistent pace you soon face a predicament — you have so much content that you:
        </p>
        <ul style={{ fontSize: '1.33em', marginBottom: '5px', marginLeft: 'auto', marginRight: 'auto' }}>
          <li>Don’t know or remember everything you have</li>
          <li>Can’t track down digital assets efficiently</li>
          <li>Struggle to collaborate with others involved in the process</li>
          <li>Aren’t leveraging existing content for reuse</li>
        </ul>
        <Divider
          as='h4'
          className='header'
          horizontal
          style={{ margin: '5em 0em 3em 0em', textTransform: 'uppercase' }}
        >
          <a href='/'>The Solution</a>
        </Divider>
        <Header textAlign='center' as='h3' style={{ fontSize: '2em' }}>AI Media Library</Header>
        <p style={{ fontSize: '1.33em', textAlign:'center' }}>
        This Serverless, AI-powered media library easiest way to store and retrieve your digital assets. 
        It securely stores your files in the cloud, and uses Artificial Intelligence to automatically generate metadata so you can quickly find and reuse content more efficiently.
        </p>
      </Container>
    </Segment>
    <Segment style={{ padding: '8em 0em' }} vertical>
      <Grid container stackable verticalAlign='middle'>
        <Grid.Row>
          <Grid.Column width={8}>
            <Header as='h3' style={{ fontSize: '2em' }}>Object & Scene Detection</Header>
            <p style={{ fontSize: '1.33em' }}>
              This media library automatically identifies thousands of objects such as vehicles, pets, and furniture. 
              It also detects scenes within an image, such as a sunset or beach. 
            </p>
            <p style={{ fontSize: '1.33em' }}>This makes it easy for you to search, filter, and curate large image libraries.</p>
          </Grid.Column>
          <Grid.Column floated='right' width={6}>
            <Image
              bordered
              rounded
              size='big'
              src='https://s3-us-west-2.amazonaws.com/photo-sharing-backend-photorepos3bucket-19pxri1qd0s3m/assets/Label-detection.png'
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
    <Segment style={{ padding: '8em 0em' }} vertical>
      <Grid container stackable verticalAlign='middle'>
        <Grid.Row>
          <Grid.Column floated='left' width={6}>
            <Image
              bordered
              rounded
              size='big'
              src='https://s3-us-west-2.amazonaws.com/photo-sharing-backend-photorepos3bucket-19pxri1qd0s3m/assets/search.png'
            />
          </Grid.Column>
          <Grid.Column width={8}>
            <Header as='h3' style={{ fontSize: '2em' }}>Full Text Search</Header>
            <p style={{ fontSize: '1.33em' }}>
            The media library automates tagging and retrieval, meaning that when team members request images, logos, and other pieces of content, it saves you time by removing much of the manual, hunt-until-you-stumble-upon-it efforts. 
            </p>
            
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
    <Segment inverted vertical style={{ padding: '2em 0em' }}>
      <Container>
        <Grid divided inverted stackable>
          <Grid.Row>
          </Grid.Row>
        </Grid>
      </Container>
    </Segment>
  </ResponsiveContainer>
)
export default withRouter(HomepageLayout)
