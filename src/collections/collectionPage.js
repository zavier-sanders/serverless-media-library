import PropTypes from 'prop-types'
import {handleSignOut, getUser} from '../auth/auth'
import React, { Component } from 'react'
import {
  Button,
  Container,
  Divider,
  Confirm,
  Header,
  Icon,
  Rating,
  Image,
  Input,
  Label,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
  Card,
  Modal,
  Dropdown,
  Form,
  Progress,
  TextArea
} from 'semantic-ui-react'

import { get, extend } from "lodash";

import {
  SearchkitManager, 
  SearchkitProvider, 
  SearchBox, 
  Hits, 
  HitItemProps,
  RefinementListFilter, 
  SearchkitComponent,
  Select,
  InitialLoader,
  Layout,
  LayoutBody,
  LayoutBuilder,
  LayoutResults,
  PageSizeSelector,
  Pagination,
  SortingSelector,
  TopBar,
  ActionBar,
  ActionBarRow,
  SelectedFilters,
  ResetFilters,
  HitsStats,
  NoHits,
  TermQuery,
  BoolMust
} from "searchkit";

import {IntervalObservable} from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first' ;
import 'rxjs/add/operator/map';
import {checkExecutionStatus} from '../utility/stepFunction';
import {getInfo, uploadAsset, getCollections, updatePhoto, archivePhoto, deletePhotoS3, deletePhoto} from '../utility/photos';
import { getUserInfo } from '../utility/users';
import {Subscription} from 'rxjs';

import { Link, withRouter } from 'react-router-dom'
import Uploader from '../upload/upload';
import Loader from '../loader/loader';
import EditItem from '../searchItem/editItem';
import Moment from 'react-moment';
import ProfileLink from '../profile/profileLink';
import { CONFIG } from '../utility/config';

import './collections.css';


/* eslint-disable react/no-multi-comp */
/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */
const HomepageHeading = ({ mobile, params }) => (

  <Container text>
    
    <Header
      as='h1'
      content={'Collection: ' + params.folder}
      inverted
      style={{
        fontSize: mobile ? '2em' : '4em',
        fontWeight: 'normal',
        marginTop: mobile ? '0.5em' : '1.5em',
        marginBottom: '0.5em',

      }}
    />
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

    // console.log(this);
    
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
    const { children, params, user } = this.props
    const { fixed } = this.state

    return (
      <Responsive {...Responsive.onlyComputer}>
        <Visibility once={false} onBottomPassed={this.showFixedMenu} onBottomPassedReverse={this.hideFixedMenu}>
          <Segment inverted textAlign='center' vertical>
            <Menu
              fixed={fixed ? 'top' : null}
              inverted={!fixed}
              secondary={!fixed}
              size='large'
            >
              <Container>
                <Menu.Item href='/' as='a'>
                {!fixed ? 
                  <img style={{paddingTop: '15px', width: '120px'}} src='/logo-v2.png' />
                  :
                  <img style={{paddingTop: '15px', width: '120px'}} src='/logo-v2.png' />
                }
                  
                </Menu.Item>
                <Menu.Item href='/' as='a' >Home</Menu.Item>
                <Menu.Item href='/collections' as='a' >Collections</Menu.Item>
                {user ? <Menu.Item as='a'><Link to={{ 
                          pathname: '/search', 
                          state: { user: user }}}>Search</Link></Menu.Item>
                : ''}
                  
                  {user ? 
                    <Menu.Menu position='right'>
                      {/* <Menu.Item as='a'><Link to="/users">People</Link></Menu.Item> */}
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
            <HomepageHeading params={params} />
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
    // console.log('user:', user)
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

const ResponsiveContainer = ({ children, params, user }) => (
  <div>
    <DesktopContainer user={user} params={params}>{children}</DesktopContainer>
    <MobileContainer user={user}>{children}</MobileContainer>
  </div>
)

ResponsiveContainer.propTypes = {
  children: PropTypes.node,
}

class SearchCollection extends SearchkitComponent {
  constructor(props) {
    super(props)

    this.state = {
      files: [],
      percent: 70,
      uploading: false,
      modalOpen: false,
      folder:  this.props.match.params.folder,
      user: getUser(),
      openUpgradeModal: false,
      openDetailModal: false,
      editMode: false,
      itemID: null,
      collectionOptions: [],
      loading: false,
      plan: '',
      fileData: {
        imageID: '',
        collectionID: '',
        fileName: '',
        collectionName: '',
        Format: '',
        Created: '',
        Notes: '',
        Tags: [],
        dimensions: '',
        rating: null
      }
    }

    this.pollExecutionArn = this.pollExecutionArn.bind(this);
    this.pollExecutionStatus = this.pollExecutionStatus.bind(this);
    this.reset = this.reset.bind(this);
    this.copyLink = this.copyLink.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.openDetailModal = this.openDetailModal.bind(this);
    this.updateFileData = this.updateFileData.bind(this);
    this.updateCollectionField = this.updateCollectionField.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.addTag = this.addTag.bind(this);

    // this.checkStatus();

    this.searchkit = new SearchkitManager(CONFIG.searchkit);
    
  }

  componentWillMount() {
    // console.log(this.state);
    let user = this.state.user;
    let album = user.email;
    let folder = this.state.folder.charAt(0).toUpperCase() + this.state.folder.slice(1);
    let collectionID = "/" + user.email;

    getCollections(user.email).then(data => { 
      this.setState({
        collectionOptions: data.map((d,i) => {
          return {
            key: i, text: d.name, name: d.name, value: d.collectionID
          }
        })
      })

      return;
      return getUserInfo(user.email);
    })
    .catch((err) => {
      console.log('Error: ', err);
    });

    this.searchkit.addDefaultQuery((query)=> {
      return query.addQuery(
        BoolMust([
          TermQuery("collectionName.keyword", folder),
          // TermQuery("userID.raw", user.email),
          TermQuery("currentStatus", 'active')
        ])
      ).
      setSort([{"@timestamp":"desc"}])
    });
  }

  InitialLoaderComponent = (props) => (
    <div className="">
      loading please wait...
    </div>
  )


  copyLink(i,data) {
    
    let imageLink = data['data-link'];
    
    window.prompt("Copy to clipboard: Ctrl+C, Enter", imageLink);
  }

  deleteFile(i) {
    this.setState({
      loading: true
    });
    let ID = i.target.dataset.link;

    if (window.confirm("Are you sure you want to delete this file?")) {
      deletePhotoS3(ID).then(() => {
        this.pollExecutionArn(ID)
        return archivePhoto(ID);
      }).then(() => {
        return deletePhoto(ID)
      }).then(() => {
        return;
      });
    } else {
      this.setState({ 
        openDetailModal: false,
        itemData: null,
        fileData: null,
        loading: false
      });
    }
    
    
  }

  saveFile() {
    this.setState({
      loading: true
    });

    let photoData = this.state.fileData;

    updatePhoto(photoData).then(data => {
      this.pollExecutionArn(photoData.imageID)
    })
  }

  HitItem = (props) => {
    const {bemBlocks, result} = props
    let thumbImg, img, labels;
    const source = extend({}, result._source, result.highlight)
    let title = source.fileName;///[^/]*$/.exec(source.imageID)[0];
    let collection = /[^/]*$/.exec(source.collectionID)[0];
    let id = source.imageID;
    if (source.tags) {
      labels = source.tags.map((tag, i) => {
        return <Label style={{margin: '3px'}} color='blue' key={i}>
            {tag}
          </Label>
      });
    } else {
      labels = <span>no tags</span>
    }

    if (source.thumbnail) {
      thumbImg = 'https://s3-us-west-2.amazonaws.com/' + source.thumbnail.s3Bucket + '/' + encodeURIComponent(source.thumbnail.s3Key);  
      img = `https://s3-us-west-2.amazonaws.com/${source.thumbnail.s3Bucket}/${source.s3key}`;  
    } else {
      thumbImg = this.renderImage(source);
      img = this.renderImage(source);
      
    }
    
    return ( 
      
      <div>
        <Card
        style={{margin: '10px'}}
        image={thumbImg} 
        header={title}
        meta={collection}
        description={labels}
        onClick={this.openDetailModal}
        data-id={id}
        // href={img}
        extra={
          <span>
            <Rating maxRating={5} disabled defaultRating={source.rating} icon='star' />
          </span>
        }
        />
      </div>
    )
  }  

  RefinementOption = (props) => (
    <div className={props.bemBlocks.option().state({selected:props.selected}).mix(props.bemBlocks.container("item"))} onClick={props.onClick}>
      <div className={props.bemBlocks.option("text")}>{props.label}</div>
      <div className={props.bemBlocks.option("count")}>{props.count}</div>
    </div>
  )

  SelectedFilter = (props) => (
    <div className={props.bemBlocks.option()
      .mix(props.bemBlocks.container("item"))
      .mix(`selected-filter--${props.filterId}`)()}>
      <div className={props.bemBlocks.option("name")}>{props.labelKey}: {props.labelValue}</div>
      <div className={props.bemBlocks.option("remove-action")} onClick={props.removeFilter}>x</div>
    </div>
  )

  handleOpen = () => { 
    this.setState({ modalOpen: true }) 
  }

  handleDrop = (data) => { 
    console.log('data', data);
    let percent = this.state.percent;
    this.setState({
      files: data.files,
      uploading: true
    });

      
      let counter = 0;
      let lastFile;
      let Metadata = Object.assign({}, data.state.metadata);
      
      for (var i = 0; i < data.files.length; i++) {
        let name = data.files[i].name;

        let blob = data.files[i];
  
        let _params = {
          Bucket: CONFIG.S3DAMBucket,
          Metadata: Object.assign({}, data.state.metadata, {keyname: name, type: data.files[i].type}),
          Key: "Incoming/" + encodeURI(data.state.metadata.collection) + "/" + encodeURI(data.files[i].name),
          Body: blob,
          ACL:'public-read'
          
        };
        console.log('_params', _params);
  
        uploadAsset(_params)
        .then (result => { 
          
          counter += 1;
          percent += 10;
          lastFile = result.key;
          // console.log(counter, lastFile);

          if (counter === data.files.length) {
            // console.log('end of files', counter, data.files.length);
            
            this.pollExecutionArn(lastFile);
          }

        })
        .catch(err => { 
          console.log(err)
          this.setState({ 
            modalOpen: false
          })
        });
      }
    
  }

  handleClose = () => this.setState({ modalOpen: false })

  openDetailModal = (e, d) => {
    
    let ID = d['data-id'];

    getInfo(ID).then((data) => {

      this.setState({
        itemID: ID,
        openDetailModal: true,
        itemData: data,
        fileData: {
          imageID: data.imageID,
          collectionID: data.collectionID,
          fileName: data.fileName,
          collectionName: data.collectionName,
          imageFormat: data.imageFormat,
          fileSize: data.fileSize,
          Created: data.uploadTime,
          Notes: data.notes,
          Tags: data.tags,
          dimensions: data.dimensions,
          rating: data.rating
        }
      });
    })
  
  }
  
  closeDetailModal = () =>  { 
    this.setState({ 
      openDetailModal: false,
      itemData: null,
      fileData: null
    });
  }

  updateFileData = (e, { value }) => {

    this.setState({
      fileData: {
        imageID: this.state.fileData.imageID,
        fileName: this.fileName.inputRef.value, 
        Notes: this.notes.ref.value,
        collectionID: this.state.fileData.collectionID,
        collectionName: this.state.fileData.collectionName,
        Tags: this.state.fileData.Tags,
        rating: this.state.fileData.rating
      }
    })
  }

  updateCollectionField = (e, data) => {
    
    let selectedValue = data.value;
    let collection = selectedValue.substring(selectedValue.lastIndexOf("/") + 1);
    let _collection = collection.charAt(0).toUpperCase() + collection.slice(1)

    this.setState({
      fileData: {
        collectionName: _collection,
        collectionID: selectedValue,
        imageID: this.state.fileData.imageID,
        fileName: this.state.fileData.fileName, 
        Notes: this.state.fileData.Notes,
        Tags: this.state.fileData.Tags,
        rating: this.state.fileData.rating
      }
    });
  }

  removeTag = (e, d) => {
    let index = d.id;
    let tags = this.state.fileData.Tags;

    this.setState({
      fileData: {
        Tags: tags.filter(e => tags.indexOf(e) !== index),
        imageID: this.state.fileData.imageID,
        fileName: this.state.fileData.fileName, 
        Notes: this.state.fileData.Notes,
        collectionName: this.state.fileData.collectionName,
        collectionID: this.state.fileData.collectionID,
        rating: this.state.fileData.rating
      }
    });

  }

  addTag = (e,d) => {

    if (e.key === 'Enter') {
      let tagName = e.target.value.trim();
      let tags = this.state.fileData.Tags;
      tags.push(tagName);

      this.setState({
        fileData: {
          Tags: tags,
          imageID: this.state.fileData.imageID,
          fileName: this.state.fileData.fileName, 
          Notes: this.state.fileData.Notes,
          collectionName: this.state.fileData.collectionName,
          collectionID: this.state.fileData.collectionID,
          rating: this.state.fileData.rating
        }
      });

    }
    
  }

  pollExecutionArn(imageID) {
    console.log('pollExecutionArn', imageID);
    this.executionArn = null;
    const interval = IntervalObservable.create(1000);
    const arnObservable = interval.switchMap(() => { return getInfo(imageID)})
      .filter((item) => (item && item.hasOwnProperty('executionArn')))
      .map((item) => (item.executionArn))
      .timeout(8000) // 8 seconds
      .first();
      //console.log('arnObservable', arnObservable);
    arnObservable.subscribe((arn) => {
      this.executionArn = arn;
      this.pollExecutionStatus(arn);
    }, (err) => {
      if (err.name && err.name === "TimeoutError") {
        console.log(err);
        // this.timeoutPollingExecutionArn = true;
        this.reset();
      }
    });
  }

  pollExecutionStatus(executionArn) {
    console.log('pollExecutionStatus', executionArn);
    let polling = Subscription;
    let successPromise = new Promise((resolve, reject) => {
      polling = IntervalObservable.create(1000)
        .switchMap(() => checkExecutionStatus(executionArn))
        .subscribe((status) => {
          this.executionStatus = status;
          if (status !== "RUNNING") {
            resolve();
          }
        });
    });
    successPromise.then(() => {
      if (polling) {
        polling.unsubscribe();
      }
      this.reset();
    });
  }

  reset() {
    setTimeout(() => {
      this.setState({ 
        uploading: false,
        files: [],
        modalOpen: false,
        openDetailModal: false,
        itemData: null,
        fileData: null,
        loading: false,
        editMode: false,
      })
  
      this.searchkit.reloadSearch();
    }, 1000)
  }

  handleRate = (e, { rating, maxRating }) => { 
    
    this.setState({
      fileData: {
        Tags: this.state.fileData.Tags,
        imageID: this.state.fileData.imageID,
        fileName: this.state.fileData.fileName, 
        Notes: this.state.fileData.Notes,
        collectionName: this.state.fileData.collectionName,
        collectionID: this.state.fileData.collectionID,
        rating: rating
      }
    });
  }

  handleCancel = () => { 
    this.setState({ openUpgradeModal: false })
  }

  renderImage = (itemData) => {
    switch (itemData.imageFormat) {
      case "PDF":
        return '../pdf-placeholder.png'
        break;

      case "TXT":
        return '../txt-placeholder.png'
        break;

      case "DOC":
        return '../doc-placeholder.png'
        break;
      
      case "DOCX":
        return '../docx-placeholder.png'
        break;

      default:
        return 'https://s3-us-west-2.amazonaws.com/' + itemData.thumbnail.s3Bucket + "/" + itemData.s3key
        break;
    }
  }

  render() {
    
    let itemData = this.state.itemData;
    let labels,
      editLabels,
      collectionOptions;


    if (itemData && itemData.tags) {
      labels = this.state.fileData.Tags.map((tag, i) => {
        return (
          <Label as='a' style={{margin: '5px'}} color='blue' id={i}>
            {tag}
          </Label>
        )
      });

      editLabels = this.state.fileData.Tags.map((tag, i) => {
        return (
          <Label onClick={this.removeTag} as='a' style={{margin: '5px'}} color='blue' id={i}>
            {tag}
            <Icon name='delete' />
          </Label>
        )
      });

    } else {
      labels = <span>no tags</span>
    }

    return (
      <ResponsiveContainer user={this.state.user} params={this.props.match.params}>
        <SearchkitProvider searchkit={this.searchkit}>
          <Layout>
            <TopBar>
              <SearchBox
                autofocus={true}
                searchOnChange={true}
                queryOptions={{analyzer:"standard"}}
                queryFields={["imageID^1","tags^10","tags.raw^1", "fileName", "collectionName.keyword", "collectionName.raw", "collectionID","collectionID.raw","imageFormat^10", "imageID.raw"]}
              prefixQueryFields={["imageID^1","tags^1","tags.raw^1", "collectionName.keyword", "collectionName.raw", "collectionID","collectionID.raw","imageFormat^10", "imageID.raw"]}/>
              
              <Modal 
                id="upload-modal" 
                open={this.state.modalOpen} 
                onClose={this.handleClose}
                trigger={<Button onClick={this.handleOpen} 
                style={{marginLeft: '10px'}} 
                primary>Upload</Button>} 
                closeIcon 
                closeOnEscape
                closeOnDimmerClick
                size='small'>
                <Modal.Header>Upload a Photo</Modal.Header>
                <Modal.Content image scrolling>
                    <Uploader onDrop={this.handleDrop.bind(this)} params={this.props.match.params}/>
                    <Modal.Description style={{marginLeft: '20px'}}>
                      <Header>Uploaded Files</Header>
                        <ul>
                          {
                            this.state.files.map(f => <li key={f.name}><Image wrapped size='small' src={f.preview}/>&nbsp;<span>{f.name}</span></li>)
                          }
                        </ul>
                        {this.state.uploading ? 
                          <Progress size='small' autoSuccess active={false} percent={this.state.percent} indicating />
                        : ''
                        }
                        {/* <Loader indeterminate text={'Uploading...'}/> */}
                    </Modal.Description>
                </Modal.Content>
              </Modal>

              {itemData ? 
                
                <Modal 
                  size="large"
                  closeIcon 
                  closeOnEscape
                  closeOnDimmerClick
                  onClose={this.closeDetailModal}
                  id="edit-modal" 
                  open={this.state.openDetailModal}>
                  <Modal.Header>{itemData.fileName}</Modal.Header>
                  <Modal.Content image>
                    <Image style={{margin: '0px auto'}} wrapped src={this.renderImage(itemData)} />
                    
                    <Modal.Description style={{width: '70%'}}>
                      
                      <Segment padded>
                        <Header size='medium'>General Information</Header>
                        <Divider/>
                        {this.state.editMode ? 
                          <Form>
                            <Form.Field inline>
                              <label>Name: </label>
                              <Input style={{width: '80%'}} ref={fileName => (this.fileName = fileName)} value={this.state.fileData.fileName} onChange={this.updateFileData} />
                            </Form.Field>
                            <Form.Field inline>
                              <label>Collection: </label>
                              <Dropdown selection style={{width: '80%'}} options={this.state.collectionOptions} data-name={this.state.fileData.collectionName} value={this.state.fileData.collectionID} onChange={this.updateCollectionField} />
                            </Form.Field>
                            <Form.Field inline>
                              <label>Notes: </label>
                              <TextArea ref={notes => (this.notes = notes)} value={this.state.fileData.Notes} onChange={this.updateFileData} />
                            </Form.Field>
                            <Form.Field inline>
                              <label>Rating: </label>
                              <Rating maxRating={5} defaultRating={this.state.fileData.rating} icon='star' ref={rating => (this.rating = rating)} onRate={this.handleRate} />
                            </Form.Field>
                          </Form>
                        : 
                          <div>
                            <p><strong>Name: </strong>&nbsp;{itemData.fileName}</p>
                            <p><strong>Collection: </strong>&nbsp;{itemData.collectionName}</p>
                            <p><strong>Notes: </strong>&nbsp;{itemData.notes}</p>
                            <p><strong>Rating: </strong>&nbsp;<Rating maxRating={5} disabled defaultRating={itemData.rating} icon='star' /></p>
                            { <p><strong>Dimensions: </strong>&nbsp;{itemData.dimensions.width} x {itemData.dimensions.height}</p> }
                            <p><strong>Format: </strong>&nbsp;{itemData.imageFormat} - {itemData.fileSize}</p>
                            <p><strong>Created: </strong>&nbsp;<Moment unix format="MM/DD/YYYY">{itemData.uploadTime}</Moment></p>
                          </div>
                        }
                        
                      </Segment>

                      <Segment padded>
                        <Header size='medium'>Tags</Header>
                        <Divider/>
                        
                        {this.state.editMode ? 
                          <div>
                          {editLabels}
                          <Input transparent style={{border: 'none', marginTop: '5px'}} fluid placeholder='Add more tags ...' onKeyPress={this.addTag} />
                          </div>
                        : <div> { labels } </div>
                        }
                      </Segment>

                      <Segment clearing padding>
                        <Header size='medium'>Actions</Header>
                        <Divider/>
                          <Button size='tiny' floated='left' icon labelPosition='right' onClick={this.copyLink} data-link={this.renderImage(itemData)}>
                            Link<Icon name='link' />
                          </Button>
                          <Button size='tiny' floated='left' labelPosition='right' icon href={this.renderImage(itemData)}>
                            Download<Icon name='download' />
                          </Button>
                          {this.state.editMode ? 
                            <div>
                              <Button size='tiny' loading={this.state.loading} floated='right' icon labelPosition='right' positive onClick={this.saveFile}>
                                Save
                                <Icon name='checkmark' />
                              </Button>
                              <Button size='tiny' floated='right' icon labelPosition='right' onClick={() => this.setState({editMode: false})}>
                                Cancel
                                <Icon name='left arrow' />
                              </Button>
                            </div>
                          : 
                            <div>
                              <Button size='tiny' loading={this.state.loading} negative data-link={itemData.imageID} icon labelPosition='right' floated='right' onClick={this.deleteFile}>
                                Delete
                                <Icon name='delete' />
                              </Button>
                              <Button size='tiny' floated='right' icon labelPosition='right' onClick={() => this.setState({editMode: true})}>
                                Edit
                                <Icon name='edit' />
                              </Button>
                            </div>
                          }
                        
                      </Segment>
                      
                    </Modal.Description>
                  </Modal.Content>
                </Modal>

              : ''
              }
            </TopBar>
            <LayoutBody>
              {/* <SideBar>
                <HierarchicalMenuFilter
                  fields={["collectionID.raw", "genres.raw"]}
                  title="Collections"
                  id="collections"/>
                <RefinementListFilter
                  id="collectionID"
                  title="Collections"
                  field="collectionID.raw"
                  operator="AND"
                  size={10}
                  itemComponent={RefinementOption}/>
              </SideBar> */}
              <LayoutResults>
                <ActionBar>
                  
                  <ActionBarRow>
                    <HitsStats/>
                    <PageSizeSelector options={[10,50,100,500]} listComponent={Select}/>
                    <SortingSelector options={[
                      {label:"Latest Releases", field:"@timestamp", order:"desc", defaultOption:true},
                      {label:"Earliest Releases", field:"@timestamp", order:"asc", key:"earliest"},
                      {label:"Highly Rated", key:"highest", fields: [
                        {field:"rating", options: {order:"desc"}},
                      ]},
                      {label:"Lowest Rated", key:"lowest", fields: [
                        {field:"rating", options: {order:"asc"}},
                      ]}
                    ]}/>
                  </ActionBarRow>

                  <ActionBarRow>
                    <SelectedFilters itemComponent={this.SelectedFilter}/>
                    <ResetFilters/>
                  </ActionBarRow>

                </ActionBar>
                <Hits hitsPerPage={50} highlightFields={["collectionID"]} sourceFilter={["tags", "thumbnail", 's3key', 'collectionID', 'rating', 'rating.raw', 'userID', 'imageID', 'imageFormat', 'fileName']}
                mod="sk-hits-grid" itemComponent={this.HitItem}/>
                <InitialLoader component={this.InitialLoaderComponent}/>
                <NoHits/>
                <Pagination showNumbers={true}/>
              </LayoutResults>
            </LayoutBody>
          </Layout>
        </SearchkitProvider>
      </ResponsiveContainer>
    )
  }
}
export default withRouter(SearchCollection)