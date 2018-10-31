import React, { Component } from 'react'
import * as ReactDOM from "react-dom";
import { get, extend } from "lodash";
import { Link, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { CONFIG } from '../utility/config';

import {
  SearchkitManager, 
  SearchkitProvider, 
  SearchBox, 
  Hits, 
  HitItemProps,
  RefinementListFilter, 
  NumericRefinementListFilter,
  SearchkitComponent,
  PageSizeSelector,
  Select,
  InitialLoader,
  Layout,
  LayoutBody,
  LayoutBuilder,
  LayoutResults,
  TopBar,
  SideBar,
  HierarchicalMenuFilter,
  ActionBar,
  ActionBarRow,
  HitsList,
  SelectedFilters,
  SortingSelector,
  Pagination,
  ResetFilters,
  HitsStats,
  NoHits,
  TermQuery,
  FilteredQuery,
  SimpleQueryString,
  QueryString,
  BoolShould,
  BoolMust,
  InputFilter
} from "searchkit";

import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Rating,
  Image,
  List,
  Table,
  Label,
  Input,
  Menu,
  Responsive,
  Popup,
  Segment,
  Sidebar,
  Visibility,
  Card, 
  Modal,
  Form,
  Dropdown,
  TextArea,
} from 'semantic-ui-react'

import { handleSignOut, getUser } from '../auth/auth'
import Uploader from '../upload/upload';
import Moment from 'react-moment';

import {IntervalObservable} from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first' ;
import 'rxjs/add/operator/map';
import {checkExecutionStatus} from '../utility/stepFunction';
import {getInfo, getCollections, updatePhoto, archivePhoto, deletePhotoS3, deletePhoto} from '../utility/photos';
import { getUserInfo } from '../utility/users';
import {Subscription} from 'rxjs';

import './searchPage.css';
import ProfileLink from '../profile/profileLink';

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
              pointing={!fixed}
              secondary={!fixed}
              size='large'
            >
              <Container>
                <Menu.Item as='a'><Link to='/'>
                {!fixed ? 
                  <img style={{ position: 'relative', top: '15px', width: '120px'}} src='/logo-v2.png' />
                  :
                  <img style={{ paddingTop: '15px', width: '120px'}} src='/logo-v2dark.png' />
                }
                  
                </Link></Menu.Item>
                <Menu.Item link as='a' ><Link to='/'>Home</Link></Menu.Item>
                <Menu.Item as='a' ><Link to='/collections'>Collections</Link></Menu.Item>
                {user ? <Menu.Item as='a'><Link to={{ 
                          pathname: '/search', 
                          state: { user: user }}}>Search</Link></Menu.Item>
                : ''}
                {/* <Link target="_blank" to='/search'><Menu.Item as='a'>Search</Menu.Item></Link> */}
                  
                  {user ? 
                    <Menu.Menu position='right'>
                      {/* <Menu.Item as='a'><Link to="/users">People</Link></Menu.Item> */}
                      <Menu.Item position='right'>
                        <ProfileLink />
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
            <Link to='/collections'><Menu.Item as='a'>Collections</Menu.Item></Link>
            <Link to={{ 
                        pathname: '/search', 
                        state: { user: user }}}><Menu.Item as='a' active>Search</Menu.Item></Link>
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

const InitialLoaderComponent = (props) => (
  <div className="">
    loading please wait...
  </div>
)

const RefinementOption = (props) => (
  <div className={props.bemBlocks.option().state({selected:props.selected}).mix(props.bemBlocks.container("item"))} onClick={props.onClick}>
    <div className={props.bemBlocks.option("text")}>{props.label}</div>
    <div className={props.bemBlocks.option("count")}>{props.count}</div>
  </div>
)

const SelectedFilter = (props) => (
  <div>
    <div>{props.labelKey}: {props.labelValue}</div>
    <div onClick={props.removeFilter}>x</div>
  </div>
)

class SearchApp extends SearchkitComponent {
  constructor(props) {
    super(props)

    this.state = {
      user: getUser(),
      searchkit: new SearchkitManager(CONFIG.searchkit),
      openDetailModal: false,
      editMode: false,
      itemID: null,
      collectionOptions: [],
      loading: false,
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

    this.HitItem = this.HitItem.bind(this);
    this.reset = this.reset.bind(this);
    this.copyLink = this.copyLink.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.openDetailModal = this.openDetailModal.bind(this);
    this.updateFileData = this.updateFileData.bind(this);
    this.updateCollectionField = this.updateCollectionField.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.addTag = this.addTag.bind(this);
  }

  componentWillMount() {
    
    let user = this.state.user;

    getCollections(user.email).then(data => { 
      this.setState({
        collectionOptions: data.map((d,i) => {
          return {
            key: i, text: d.name, name: d.name, value: d.collectionID
          }
        })
      })
    });

    this.state.searchkit.addDefaultQuery((query)=> {
      return query.addQuery(
        BoolMust([
          //TermQuery("userID.keyword", user.email),
          TermQuery("currentStatus.keyword", 'active')
        ])
      ).
      setSort([{"@timestamp":"desc"}])
    });
  }

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
        return archivePhoto(ID);
      }).then(() => {
        return deletePhoto(ID)
      }).then(() => {
        this.pollExecutionArn(ID)
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
    console.log('updateCollectionField', selectedValue,collection);

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
    this.executionArn = null;
    const interval = IntervalObservable.create(1000);
    const arnObservable = interval.switchMap(() => getInfo(imageID))
      .filter((item) => (item && item.hasOwnProperty('executionArn')))
      .map((item) => (item.executionArn))
      .timeout(8000) // 8 seconds
      .first();
      console.log('arnObservable', arnObservable);
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
      
      this.state.searchkit.reloadSearch();
      this.forceUpdate();
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

    let searchkit = this.state.searchkit;
    
    const customQueryBuilder = (query, options) => {

      if(query){
        return QueryString(query, options)
      } else {
        return query.addQuery(
          BoolMust([
            //TermQuery("userID", this.state.user.email),
            TermQuery("currentStatus.keyword", 'active')
          ])
        ).
        setSort([{"@timestamp":"desc"}])
      }
    }

    return (
      <ResponsiveContainer user={this.state.user}>
        <SearchkitProvider searchkit={searchkit}>
          <Layout size="1">
            <TopBar>
              <SearchBox
                autofocus={true}
                searchOnChange={true}
                queryBuilder={customQueryBuilder}
                queryOptions={{analyzer:"standard"}}
                queryFields={["imageID^1","tags^10","tags.raw^1", "fileName", "collectionName.keyword", "collectionName.raw", "collectionID","collectionID.raw","imageFormat^10", "imageID.raw"]}
              prefixQueryFields={["imageID^1","tags^1","tags.raw^1", "collectionName.keyword", "collectionName.raw", "collectionID","collectionID.raw","imageFormat^10", "imageID.raw"]}/>
              {/* <Modal id="upload-modal" trigger={<Button style={{marginLeft: '10px'}} primary>Upload</Button>} closeIcon size='small'>
                <Modal.Header>Upload a Photo</Modal.Header>
                <Modal.Content children>
                    <Uploader params={this.props.match.params}/>
                </Modal.Content>
              </Modal> */}

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
                    <Image style={{margin: '0px auto'}} wrapped size='large' src={this.renderImage(itemData)} />
                  
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
                              <TextArea style={{display: 'inline', width: '80%'}} ref={notes => (this.notes = notes)} value={this.state.fileData.Notes} onChange={this.updateFileData} />
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
                            <p><strong>Dimensions: </strong>&nbsp;{itemData.dimensions.width} x {itemData.dimensions.height}</p>
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
                          <Button floated='left' onClick={this.copyLink} data-link={this.renderImage(itemData)}>
                            <Icon name='link' />
                          </Button>
                          <Button floated='left' icon href={this.renderImage(itemData)}>
                            <Icon name='download' />
                          </Button>
                        {this.state.editMode ? 
                          <div>
                            <Button loading={this.state.loading} floated='right' icon labelPosition='right' positive onClick={this.saveFile}>
                              Save
                              <Icon name='checkmark' />
                            </Button>
                            <Button floated='right' icon labelPosition='right' onClick={() => this.setState({editMode: false})}>
                              Cancel
                              <Icon name='left arrow' />
                            </Button>
                          </div>
                        : 
                          <div>
                            <Button loading={this.state.loading} negative data-link={itemData.imageID} icon labelPosition='right' floated='right' onClick={this.deleteFile}>
                              Delete
                              <Icon name='delete' />
                            </Button>
                            <Button floated='right' icon labelPosition='right' onClick={() => this.setState({editMode: true})}>
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
              <SideBar>
                <HierarchicalMenuFilter
                  fields={["collectionName.keyword", "tags.keyword"]}
                  title="Collections"
                  id="collections"
                  size={100}
                  />
                <RefinementListFilter
                  id="imageFormat"
                  title="Format"
                  field="imageFormat.keyword"
                  operator="AND"
                  size={10}
                  />
                  <InputFilter
                    id="notes"
                    title="Notes Filter"
                    placeholder="Search notes"
                    searchOnChange={true}
                    prefixQueryFields={["notes"]}
                    queryFields={["notes"]}
                  />
                
              </SideBar>
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
                    <SelectedFilters/>
                    <ResetFilters/>
                  </ActionBarRow>

                </ActionBar>
                <Hits hitsPerPage={50} highlightFields={["collectionID", "imageID"]} sourceFilter={["tags", "thumbnail", 's3key', 'collectionID', 'userID', 'imageID', 'notes', 'rating', 'rating.raw', 'fileName', 'imageFormat', 'currentStatus', 'collectionName']}
                mod="sk-hits-grid" itemComponent={this.HitItem}/>
                <InitialLoader component={InitialLoaderComponent}/>
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

export default SearchApp;