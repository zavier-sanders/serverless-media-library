import Amplify, { API } from 'aws-amplify';
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
  Input,
  Label,
  Menu,
  Message,
  Responsive,
  Segment,
  Confirm,
  Sidebar,
  Visibility,
  Modal,
  Progress,
  Form,
  Dropdown,
  TextArea,
} from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import {  handleSignUp, getCurrentUser, getUser, checkEmailPattern, checkNamePattern } from '../auth/auth'
import Moment from 'react-moment';
import { CONFIG } from '../utility/config';

import Loader from '../loader/loader';
import { createUser, getUserInfo, updateUserStatus, getUsers, updateUserData } from '../utility/users';
import { deleteCollection, archivePhotos, deletePhotosS3, getCollections, createCollection } from '../utility/photos';
var randomize = require('randomatic');

class PeopleTable extends Component {
  constructor() {
    super();
    
    this.state = {
      tableData: [],
      freshTable: true,
      user: getUser(),
      editMode: false,
      openDetailModal: false,
      openNewModal: false,
      viewUser: null,
      editUser: null,
      newUser: {
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        role: '',
        currentStatus: ''
      },
      loading: false,
      errorMessage: '',
      roleOptions: [
        {key: 'admin', text: 'Admin', name: 'admin', value: 'admin'},
        {key: 'contributor', text: 'Contributor', name: 'contributor', value: 'contributor'},
        {key: 'reviewer', text: 'Reviewer', name: 'reviewer', value: 'reviewer'},
      ]
    }
    
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEditOpen = this.handleEditOpen.bind(this);
    this.handleNewOpen = this.handleNewOpen.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.updateUserData = this.updateUserData.bind(this);
    this.updateNewUserData = this.updateNewUserData.bind(this);
    this.saveUserEdit = this.saveUserEdit.bind(this);
    this.saveUserNew = this.saveUserNew.bind(this);
    this.renderErrorMessage = this.renderErrorMessage.bind(this);

  }

  componentWillMount() {

    let user = this.state.user;

    getUserInfo(user.email)
    .then((user) => {
      this.setState({
        user,
        plan: user.currentPlan
      });
      this.fetchUserList();
    }) 
    .catch((err) => {
      console.log('Error: ', err);
    });
      
  }

  componentDidMount() {
    
  }

  fetchUserList = () => {
    let user = this.state.user;

    getUsers().then(data => {
      if (data.Items.length > 0) {
        data.Items.sort(function(a,b){return b.created - a.created});
        this.setState({
          tableData: data.Items,
          count: data.count,
          freshTable: false
        });
      }
      return data;
    }).catch ( err => console.log(err))

  }

  renderErrorMessage = (message) => {
    return (
      <Message negative style={{textAlign: 'left'}}>
        Error: { message }
      </Message>
    )
  }

  handleDelete = async (e) => {
    let email = e.target.name;

    if(window.confirm("Are you sure you want to delete this user?")) {
      let data = {
        email: email,
        status: 'disabled',
      }
  
      updateUserStatus(data)
      .then((data) => {
        this.fetchUserList();
        this.forceUpdate();
        return;   
      }).catch((err) => {
        console.log('Error: ', err);
      })
    } else {
      return;
    }
    
  }

  handleNewOpen = () => {
    this.setState({
      openNewModal: true
    })
  }

  handleEditOpen = (e, d) => { 
    let ID = e.target.dataset.id;
    console.log(ID);

    getUserInfo(ID).then((data) => {
      console.log(data);

      this.setState({
        openDetailModal: true,
        viewUser: data,
        editUser: {
          firstName: data.firstName,
          lastName: data.lastName,
          // company: data.company,
          created: data.created,
          currentPlan: data.currentPlan,
          currentStatus: data.currentStatus,
          email: data.email,
          picture: data.picture,
          role: data.role,
          username: data.username,
        }
      });
    })
  }

  closeModal = () =>  { 
    this.setState({ 
      openDetailModal: false,
      openNewModal: false,
      editMode: false,
      viewUser: null,
      editUser: null
    });
  }

  saveUserNew() {
    const { firstName, lastName, email, role } = this.state.newUser
    if (!email || !firstName || !lastName || !role) {
      this.setState({
        errorMessage: 'Please fill all fields in the form.'
      })
    } else {
      this.setState({
        errorMessage: ''
      })
      let newUser = {
        email: this.state.newUser.email,
        password: randomize('Aa0', 8),
        firstName: this.state.newUser.firstName,
        lastName: this.state.newUser.lastName,
        username: this.state.newUser.firstName + '.' + this.state.newUser.lastName,
        role: this.state.newUser.role,
        status: 'active',
      }
      console.log(newUser);

      if (newUser) {
        handleSignUp(
          newUser.email,
          newUser.password,
          newUser.username,
          newUser.firstName,
          newUser.lastName,
          newUser.role,
          newUser.status,
          () => {
            this.fetchUserList();
            this.closeModal();
          }
        )
      }
      
    }
  
  }

  saveUserEdit() {
    let editUser = this.state.editUser;
    console.log('editUser', editUser);
    
    this.setState({
      loading: true,
    });

    updateUserData(editUser).then(data => {
      this.setState({
        loading: false, 
        openDetailModal: false,
        editMode: false
      });
      this.fetchUserList();
      this.forceUpdate();
      return;
    })
  }

  updateNewUserData() {
    
    this.setState({
      newUser: {
        email: this.emailNew.inputRef.value,
        firstName: this.firstNameNew.inputRef.value,
        lastName: this.lastNameNew.inputRef.value,
        role: this.state.newUser.role
      }
    })
  }
  
  updateUserData() {
    this.setState({
      editUser: {
        email: this.state.editUser.email,
        firstName: this.firstName.inputRef.value,
        lastName: this.lastName.inputRef.value,
        username: this.username.inputRef.value,
        picture: this.picture.inputRef.value,
        role: this.state.editUser.role
      }
    })
  }

  updateNewRoleField= (e, data) => {
    
    let role = data.value;

    this.setState({
      newUser: {
        email: this.state.newUser.email,
        firstName: this.firstNameNew.inputRef.value,
        lastName: this.lastNameNew.inputRef.value,
        role: role
      }
    });
  }
  
  updateRoleField= (e, data) => {
    
    let role = data.value;
    console.log(role);

    this.setState({
      editUser: {
        email: this.state.editUser.email,
        firstName: this.firstName.inputRef.value,
        lastName: this.lastName.inputRef.value,
        username: this.username.inputRef.value,
        picture: this.picture.inputRef.value,
        role: role
      }
    });
  }

  renderEditButtons = () => {
    let viewUser = this.state.viewUser;
    let editMode = this.state.editMode;
    let user = this.state.user;

    if (user.role == 'admin' || user.role == 'owner') {
      return (
        <Segment clearing padding='true'>
          <Header size='medium'>Actions</Header>
          <Divider/>
            {editMode ? 
              <div>
                  <Button floated='left' icon labelPosition='right' onClick={() => this.setState({editMode: false})}>
                  Cancel
                  <Icon name='left arrow' />
                </Button>
                <Button loading={this.state.loading} floated='left' icon labelPosition='right' positive onClick={this.saveUserEdit}>
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
                <Button loading={this.state.loading} negative data-link={viewUser.email} icon labelPosition='right' floated='left' onClick={this.handleDelete}>
                  Delete
                  <Icon name='delete' />
                </Button>
              </div>
            }
          
        </Segment>
      )
    }
  }

  renderEditUserModal = () => {
    let viewUser = this.state.viewUser;
    let editUser = this.state.editUser;
    let editMode = this.state.editMode;

    if (this.state.viewUser) {
      return (
        <Modal 
          id="edit-modal" 
          open={this.state.openDetailModal}
          onClose={this.closeModal}
          size="large"
          closeIcon 
          closeOnEscape
          closeOnDimmerClick
          >
          <Modal.Header>{viewUser.firstName + ' ' + viewUser.lastName}</Modal.Header>
          <Modal.Content image>
            <Image style={{margin: '0px auto'}} wrapped src={viewUser.picture} />
            <Modal.Description style={{width: '70%'}}>     
              <Segment padded>
                <Header size='medium'>General Information</Header>
                <Divider/>
                {this.state.editMode ? 
                  <Form>
                    <Form.Field inline>
                      <label>First Name: </label>
                      <Input style={{width: '80%'}} ref={firstName => (this.firstName = firstName)} value={editUser.firstName} onChange={this.updateUserData} />
                    </Form.Field>
                    
                    <Form.Field inline>
                      <label>Last Name: </label>
                      <Input style={{width: '80%'}} ref={lastName => (this.lastName = lastName)} value={editUser.lastName} onChange={this.updateUserData} />
                    </Form.Field>
                    
                    <Form.Field inline>
                      <label>Username: </label>
                      <Input style={{width: '80%'}} ref={username => (this.username = username)} value={editUser.username} onChange={this.updateUserData} />
                    </Form.Field>

                    <Form.Field inline>
                      <label>Role: </label>
                      <Dropdown selection style={{width: '80%'}} options={this.state.roleOptions} data-name={this.state.viewUser.role} value={editUser.role} onChange={this.updateRoleField} />
                    </Form.Field>
      
                    <Form.Field inline>
                      <label>Profile Image: </label>
                      <Input style={{width: '80%'}} placeholder="Add a image link" ref={picture => (this.picture = picture)} value={editUser.picture} onChange={this.updateUserData} />
                    </Form.Field>
      
                  </Form>
                : 
                  <div>
                    <p><strong>First Name: </strong>&nbsp;{viewUser.firstName || ''}</p>
                    <p><strong>Last Name: </strong>&nbsp;{viewUser.lastName || ''}</p>
                    <p><strong>Username: </strong>&nbsp;{viewUser.username}</p>
                    <p><strong>Role: </strong>&nbsp;{viewUser.role}</p>
                    <p><strong>Email: </strong>&nbsp;{viewUser.email}</p>
                    <p><strong>Created: </strong>&nbsp;<Moment unix format="MM/DD/YYYY">{viewUser.created}</Moment></p>
                  </div>
                }
                
              </Segment>
              {this.renderEditButtons()}
            </Modal.Description>
          </Modal.Content>
        </Modal>
      )
    }
  }

  renderNewUserModal = () => {
    let openNewModal = this.state.openNewModal;
    
    if (openNewModal) {
      return (
        <Modal
          id="new-modal"  
          size='tiny'
          open={this.state.openNewModal} 
          onClose={this.closeModal}
          closeIcon 
          closeOnEscape
          closeOnDimmerClick
          >
          <Modal.Header>
            Add New User
          </Modal.Header>
          <Modal.Content>
            { this.state.errorMessage && this.renderErrorMessage(this.state.errorMessage) }
            <Form>
              <Form.Field>
                <Input
                  required={true}
                  size='large'
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='First Name'
                  ref={firstNameNew => (this.firstNameNew = firstNameNew)}
                  value={this.state.newUser.firstName}
                  onChange={this.updateNewUserData}
                />
                { this.state.newUser.firstName && !checkNamePattern(this.state.newUser.firstName) && this.renderErrorMessage('Invalid first name')}
              </Form.Field>

                <Form.Field>
                  <Input
                    required={true}
                    size='large'
                    fluid
                    icon='user'
                    iconPosition='left'
                    placeholder='Last Name'
                    ref={lastNameNew => (this.lastNameNew = lastNameNew)}
                    value={this.state.newUser.lastName}
                    onChange={this.updateNewUserData}
                  />
                  { this.state.newUser.lastName && !checkNamePattern(this.state.newUser.lastName) && this.renderErrorMessage('Invalid last name')}
                </Form.Field>

              <Form.Field>
                <Input  
                  required={true}
                  size='large'
                  fluid
                  icon='mail'
                  iconPosition='left'
                  placeholder='E-mail address'
                  ref={emailNew => (this.emailNew = emailNew)}
                  value={this.state.newUser.email}
                  onChange={this.updateNewUserData}
                />
                { this.state.newUser.email && !checkEmailPattern(this.state.newUser.email) && this.renderErrorMessage('Invalid email address')}
              </Form.Field>

              <Form.Field fluid>
                <Dropdown size='large' fluid placeholder='Role' selection ref={roleNew => (this.roleNew = roleNew)} options={this.state.roleOptions} value={this.state.newUser.role} onChange={this.updateNewRoleField} />
              </Form.Field>

            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={this.closeModal}>
              Cancel
            </Button>
            <Button positive icon='checkmark' labelPosition='right' content='Submit' onClick={this.saveUserNew} />
          </Modal.Actions>
        </Modal>
      )
    }
  }

  renderTable() {
      return (
        <Grid.Row>
          <Grid.Column textAlign='center'>
            <Table celled inverted selectable sortable>
              <Table.Header>
                <Table.Row textAlign='center'>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Role</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                { this.state.tableData && this.state.tableData.map((data, i) =>
                  <Table.Row key={data.email}>
                      <Table.Cell textAlign='center'><p>{data.firstName + ' ' + data.lastName} <br/> {data.email}</p></Table.Cell>
                      <Table.Cell textAlign='center'>{data.role}</Table.Cell>
                      <Table.Cell textAlign='center'><Moment unix format="MM/DD/YYYY">{data.created}</Moment></Table.Cell>
                      <Table.Cell textAlign='center'>
                        <Button data-id={data.email} onClick={this.handleEditOpen} 
                            style={{marginRight: '10px'}} 
                            primary>View</Button>
                        <Button id={data.email} name={data.email} negative onClick={this.handleDelete}>Delete</Button>
                      </Table.Cell>
                  </Table.Row>
                )}
                
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      )
  }
  

  render() {
    const { children } = this.props
    const { fixed } = this.state

    return (
      <Segment style={{ padding: '4em 0em' }} vertical>
        <Grid container stackable verticalAlign='middle'>
          <Grid.Row>
            <Header
              as='h1'
              content='Users'
              style={{
                fontWeight: 'normal',
                marginBottom: 0,
                paddingLeft: '15px',
                paddingBottom: '30px'
              }}
            />
          </Grid.Row>
          <Grid.Row style={{ paddingLeft: '15px', paddingRight: '15px', display: 'block' }}>
            {/* <Input ref={name => (this.name = name)} style={{ paddingRight: '20px' }} placeholder='Search for people...' />
            <Button basic onClick={this.createCollection}>Search</Button> */}
            <Button primary onClick={this.handleNewOpen}>Add User</Button>
          </Grid.Row>
          {this.renderEditUserModal()}
          {this.renderNewUserModal()}
          {this.renderTable()}
        </Grid>
      </Segment>
    )
  }
}

export default PeopleTable;