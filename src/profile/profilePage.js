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
  Form,
  Dropdown,
  Card,
  Progress,
  TextArea,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
} from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import { checkS3Storage } from '../utility/photos'
import { getUserInfo, updateUserData, updateUserStatus } from '../utility/users'
import { CONFIG } from '../utility/config';

import ProfileLink from './profileLink';


/* eslint-disable react/no-multi-comp */
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
                  <img style={{ paddingTop: '15px', width: '120px'}} src='/logo-v2.png' />
                  :
                  <img style={{ paddingTop: '15px', width: '120px'}} src='/logo-v2dark.png' />
                }
                  
                </Link></Menu.Item>
                <Menu.Item as='a' ><Link to='/'>Home</Link></Menu.Item>
                <Menu.Item as='a' ><Link to='/collections'>Collections</Link></Menu.Item>
                {user ? <Menu.Item as='a'><Link to={{ 
                          pathname: '/search', 
                          state: { user: user }}}>Search</Link></Menu.Item>
                : ''}
                {/* <Link target="_blank" to='/search'><Menu.Item as='a'>Search</Menu.Item></Link> */}
                  
                  {user ? 
                    <Menu.Menu position='right'>
                      {/* <Menu.Item as='a'><Link to="/company/members">People</Link></Menu.Item> */}
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

class ProfilePage extends Component {
  constructor() {
    super();
    
    this.state = {
      user: getUser(),
      editMode: false,
      loading: false,
      editUser: {}
    }

    this.renderDisplayMode = this.renderDisplayMode.bind(this);
    this.renderEditMode = this.renderEditMode.bind(this);
    this.saveFile = this.saveFile.bind(this);    
    this.updateUserData = this.updateUserData.bind(this);
  }

  componentWillMount() {
    let user = this.state.user;
    let collectionID = user.email;
    
    getUserInfo(user.email)
    .then((data) => {
      this.setState({
        user: data,
        editUser: {
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: data.username,
          picture: data.picture,
        }
      });
      return;
    })
    .catch((err) => {
      console.log('Error: ', err);
    });

  }

  saveFile() {
    let editUser = this.state.editUser;
    
    this.setState({
      loading: true,
      user: editUser
    });

    updateUserData(editUser).then(data => {
      this.setState({loading: false, editMode: false})
      return this.forceUpdate();
    })
  }

  updateUserData() {
    this.setState({
      editUser: {
        email: this.state.user.email,
        firstName: this.firstName.inputRef.value,
        lastName: this.lastName.inputRef.value,
        username: this.username.inputRef.value,
        picture: this.picture.inputRef.value,
      }
    })
  }

  renderDisplayMode() {
    let user = this.state.user;

    return (
        <div>
          <Grid>
            <Grid.Row style={{paddingBottom: '30px'}}>
              <Grid.Column width="4">
                <Image src={user.picture} verticalAlign='middle' circular="true" size='medium' />
              </Grid.Column>
              <Grid.Column width="9">
                <p><strong>First Name: </strong>&nbsp;{user.firstName || ''}</p>
                <p><strong>Last Name: </strong>&nbsp;{user.lastName || ''}</p>
                <p><strong>Username: </strong>&nbsp;{user.username}</p>
                <p><strong>Email: </strong>&nbsp;{user.email}</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
    ) 
  }
  
  renderEditMode() {
    let editUser = this.state.editUser;

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Form>
              <Form.Field inline>
                <label>First Name: </label>
                <Input style={{width: '80%'}} ref={firstName => (this.firstName = firstName)} value={editUser.firstName || ''} onChange={this.updateUserData} />
              </Form.Field>
              
              <Form.Field inline>
                <label>Last Name: </label>
                <Input style={{width: '80%'}} ref={lastName => (this.lastName = lastName)} value={editUser.lastName || ''} onChange={this.updateUserData} />
              </Form.Field>
              
              <Form.Field inline>
                <label>Username: </label>
                <Input style={{width: '80%'}} ref={username => (this.username = username)} value={editUser.username} onChange={this.updateUserData} />
              </Form.Field>

              <Form.Field inline>
                <label>Profile Image: </label>
                <Input style={{width: '80%'}} placeholder="Add a image link" ref={picture => (this.picture = picture)} value={editUser.picture} onChange={this.updateUserData} />
              </Form.Field>

            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      
    ) 
  }


  render() {
    let editMode = this.state.editMode;
    let user = this.state.user;

    return (
      <ResponsiveContainer user={this.state.user}>
        <Segment style={{ padding: '4em 0em' }} vertical>
          <Grid container stackable divided='vertically'>
            <Grid.Row style={{ paddingLeft: '15px', display: 'block', paddingBottom: '30px' }}>
              <Grid.Column width="8">
                <Header
                  as='h1'
                  content='Account'
                  style={{
                    fontWeight: 'normal',
                    marginBottom: 0,
                    paddingBottom: '40px'
                  }}
                />
                {!editMode && user && this.renderDisplayMode()}
                {editMode && this.renderEditMode()}
                
                <div style={{paddingTop: '30px'}}>
                  {editMode ? 
                    <div>
                       <Button floated='left' icon labelPosition='right' onClick={() => this.setState({editMode: false})}>
                        Cancel
                        <Icon name='left arrow' />
                      </Button>
                      <Button loading={this.state.loading} floated='left' icon labelPosition='right' positive onClick={this.saveFile}>
                        Save
                        <Icon name='checkmark' />
                      </Button>
                    </div>
                  : 
                    <div>
                      <Button floated='left' icon labelPosition='right' onClick={() => this.setState({editMode: true})}>
                        Edit
                        <Icon name='edit' />
                      </Button>
                    </div>
                  }
                </div>
              </Grid.Column>
              <Grid.Column width="4">
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </ResponsiveContainer>
    )
  }
}
export default withRouter(ProfilePage)
