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
  Form,
  Dropdown,
} from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import { getCurrentUser, getUser } from '../auth/auth'
import Moment from 'react-moment';
import { CONFIG } from '../utility/config';

import { getUserInfo, getUsers, updateUserStatus } from '../utility/users';
import { deleteCollection, archivePhotos, deletePhotosS3, getCollection, getCollections, createCollection } from '../utility/photos';

class CollectionsTable extends Component {
  constructor() {
    super();
    
    this.state = {
      tableData: [],
      freshTable: true,
      user: getUser(),
      openDetailModal: false,
      openNewModal: false,
      viewCollection: null,
      editCollection: null,
      isFetching: false,
      multiple: true,
      search: true,
      searchQuery: null,
      value: [],
      options: [],
      people: []
    }

    this.createCollection = this.createCollection.bind(this);
    this.handleEditOpen = this.handleEditOpen.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.onClosed = this.onClosed.bind(this);
    this.closeModal = this.closeModal.bind(this);

  }

  componentWillMount() {

    let user = this.state.user;

    getUserInfo(user.email)
    .then((user) => {
      this.setState({
        user,
        plan: user.currentPlan
      });
      this.fetchMenuList();
    }) 
    .catch((err) => {
      console.log('Error: ', err);
    });
      
  }

  fetchMenuList = async () => {
    let user = this.state.user;
    console.log('user', user);

    getCollections(user.email).then(data => {
      if (data.length > 0) {
        data.sort(function(a,b){return b.creationTime - a.creationTime});
        this.setState({
          tableData: data,
          freshTable: false
        });
      }
      return data;
    }).catch ( err => console.log(err))

  }

  createCollection = () => {
      let user = this.state.user;
      let name = this.name.inputRef.value.trim().toLowerCase();
      let nameFormatted = name.replace(/[^\w\s]/gi, '').replace(/ /g, '+');
      // let album = user.company; //(this.state.user['custom:company']) ? this.state.user['custom:company'] : user.email;
      let collections = this.state.tableData;
      //console.log(user, collections);

      if (name) {
        let params = {
          "collectionID": user.email + "/" + name,
          "creationTime": Math.floor(new Date().getTime() / 1000),
          "name": name,
          "userID": user.email,
          "status": "active",
          "people": [user.email]
        };
  
        
        let table = this.state.tableData;
        table.unshift(params);
  
        this.setState({
          tableData: table
        });
  
        createCollection(params).then(data => {
          this.name.inputRef.value = '';
          this.fetchMenuList();
          return;
        })
      } else {
        this.name.inputRef.focus();
      }
      
  }

  handleDelete = async (e) => {
    let collectionID = e.target.id;
    let user = this.state.user;
    console.log(collectionID);

    if(window.confirm("Are you sure? This will also delete all photos within this collection?")) {
      deleteCollection(collectionID).then((data) => {
        return deletePhotosS3(collectionID); 
      }).then((data) => {
        return archivePhotos(collectionID);
      }).then((data) => {
        this.fetchMenuList();
        this.forceUpdate();
        return;
      });
    } else {
      return;
    }
  }

  handleConfirm = () =>{
    console.log('handleConfirm', this);
    this.setState({ open: false })
  }

  handleCancel = () => { 
    this.setState({ open: false })
  }

  handleEditOpen = (e, d) => { 
    let ID = e.target.id;
    console.log(ID);

    getCollection(ID).then((data) => {
      console.log(data);

      this.setState({
        openDetailModal: true,
        viewCollection: data,
        editCollection: {
          collectionID: data.collectionID,
          creationTime: data.creationTime,
          name: data.name,
          status: data.status,
          userID: data.userID,
          people: data.people || []
        }
      });
    })
  }

  closeModal = () =>  { 
    this.setState({ 
      openDetailModal: false,
      openNewModal: false,
      editMode: false,
      viewCollection: null,
      editCollection: null
    });
  }
  
  onClosed = () => {
    this.forceUpdate();
  }

  renderEditButtons = () => {
    let viewCollection = this.state.viewCollection;
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
                <Button loading={this.state.loading} negative data-link={viewCollection.email} icon labelPosition='right' floated='left' onClick={this.handleDelete}>
                  Delete
                  <Icon name='delete' />
                </Button>
              </div>
            }
          
        </Segment>
      )
    }
  }

  fetchPeople = (people) => {
    return people.map((user) => {
      return getUserInfo(user).then((data)=> {
        let person = { 
          firstName: data.firstName,
          lastName: data.lastName,
          picture: data.picture,
        };
        return person;
      })
    }); 
  }

  fetchAllUsers = () => {
    return getUsers().then((data)=> {
      return data.Items.map((user) => {
        let users = { 
          key: user.email, 
          text: user.firstName + ' ' + user.lastName, 
          value: user.email 
        };
        return users;
      })
      
    })
  }

  handleChange = (e, { value }) => this.setState({ value })
  handleSearchChange = (e, { searchQuery }) => this.setState({ searchQuery })
  
  updateCollectionData = () => { 
    this.setState({
      editCollection: {
        collectionID: this.state.editCollection.collectionID,
        creationTime: this.state.editCollection.creationTime,
        name: this.name.inputRef.value.trim(),
        status: this.state.editCollection.status,
        userID: this.state.editCollection.userID,
        people: this.state.editCollection.people || []
      }
    })
  }

  renderEditUserModal = () => {
    let viewCollection = this.state.viewCollection;
    let editCollection = this.state.editCollection;
    let editMode = this.state.editMode;
    let { isFetching, search, value, people, options } = this.state;
    let users = [];
    
    if (viewCollection) {
      
      let users = this.fetchPeople(viewCollection.people);
      let allUsers = this.fetchAllUsers();

      Promise.all(users).then((data) => {
        // console.log(data);
        people = data;
        return allUsers;
      }).then((data) => {
        // console.log(data); 
        options = data;
        this.setState({
          people: people,
          options: options,
          promiseIsResolved: true
        });
        return;
      });
      
      if (this.state.promiseIsResolved) {
        return (
          <Modal 
            id="edit-modal" 
            open={this.state.openDetailModal}
            onClose={this.closeModal}
            size="small"
            closeIcon 
            closeOnEscape
            closeOnDimmerClick
            >
            <Modal.Header>{viewCollection.name}</Modal.Header>
            <Modal.Content>
              <Modal.Description style={{margin: '0px auto'}}>     
                <Segment padded>
                  <Header size='medium'>General Information</Header>
                  <Divider/>
                  {this.state.editMode ? 
                    <Form>
                      <Form.Field inline>
                        <label>Name: </label>
                        <Input style={{width: '80%'}} ref={name => (this.name = name)} value={editCollection.name} onChange={this.updateCollectionData} />
                      </Form.Field>
  
                      <Form.Field inline>
                        <label>People: </label>
                        {/* <Dropdown selection style={{width: '80%'}} options={this.state.roleOptions} data-name={this.state.viewCollection.role} value={editCollection.role} onChange={this.updateRoleField} /> */}
                        <Dropdown
                          fluid
                          selection
                          multiple='true'
                          search='true'
                          options={this.state.options}
                          value={value}
                          placeholder='Add People'
                          onChange={this.handleChange}
                          onSearchChange={this.handleSearchChange}
                          disabled={isFetching}
                          loading={isFetching}
                        />
                      </Form.Field>
        
                    </Form>
                  : 
                    <div>
                      <p><strong>Name: </strong>&nbsp;{viewCollection.name}</p>
                      <p><strong>Owner: </strong>&nbsp;{viewCollection.userID}</p>
                      <p><strong>Created: </strong>&nbsp;<Moment unix format="MM/DD/YYYY">{viewCollection.creationTime}</Moment></p>
                      <div><strong>People: </strong>&nbsp;
                        <div>
                          <List divided horizontal size='small'>
                            {people.map((data) => {
                              return (
                                <List.Item>
                                  <Image avatar src={data.picture} />
                                  <List.Content>
                                    <List.Header>{data.firstName + ' ' + data.lastName}</List.Header>
                                  </List.Content>
                                </List.Item>
                              )
                            })}
                          </List>
                          <br />
                        </div>
                      </div>
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
  }

  renderTable() {
    if (this.state.tableData.length > 0) {
      return (
        <Grid.Row>
          <Grid.Column textAlign='center'>
            <Table celled inverted selectable sortable>
              <Table.Header>
                <Table.Row textAlign='center'>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Owner</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                { this.state.tableData && this.state.tableData.map((data, i) =>
                  <Table.Row key={data.albumID}>
                      <Table.Cell textAlign='center'>{data.name}</Table.Cell>
                      <Table.Cell textAlign='center'>{data.userID}</Table.Cell>
                      <Table.Cell textAlign='center'><Moment unix format="MM/DD/YYYY">{data.creationTime}</Moment></Table.Cell>
                      <Table.Cell textAlign='center'>
                        <Link to={{ 
                        pathname: 'collection/' + data.name, 
                        state: { user: this.state.user, folder: data.name } 
                        }}><Button primary style={{marginRight: '10px'}}>View</Button>
                        </Link>
                        <Button id={data.albumID} name={data.name} negative onClick={this.handleDelete}>Delete</Button>
                      </Table.Cell>
                  </Table.Row>
                )}
                
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      )
    } else {
      return (
        <Grid.Row>
          <Grid.Column textAlign='left'>
            <Message>
              <Message.Header styles={{marginBottom: '20px'}}>
                Create a Collection
              </Message.Header>
              <Message.Item>A "collection" is a bucket that stores your images</Message.Item>
              <Message.Item>Use the input field above to create a collection</Message.Item>
            </Message>
          </Grid.Column>
        </Grid.Row>
      )
    }
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
              content='Collections'
              style={{
                // fontSize: '4em',
                fontWeight: 'normal',
                marginBottom: 0,
                paddingLeft: '15px',
                paddingBottom: '30px'
              }}
            />
          </Grid.Row>
          <Grid.Row style={{ paddingLeft: '15px', display: 'block' }}>
            <Input ref={name => (this.name = name)} style={{ paddingRight: '20px' }} placeholder='Add new collection...' />
            <Button primary onClick={this.createCollection}>Create</Button>
          </Grid.Row>
          {/* <Grid.Row verticalAlign='middle' stretched>
            <Loader style={{marginTop: '250px'}} active={'active'} text={'Fetching collections...'}/>
          </Grid.Row> */}
          {this.renderTable()}
          {this.state.openDetailModal && this.renderEditUserModal()}
          {/* {this.renderNewUserModal()} */}
        </Grid>
      </Segment>
    )
  }
}

export default CollectionsTable;