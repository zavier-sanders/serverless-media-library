import React, { Component } from 'react'
import { Segment, Button, Form, Grid, Header, Message, List } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { MSG_PASSWORD_PATTERN, checkEmailPattern, checkPasswordPattern, checkNamePattern,
         handleResendVerificationCode, handleSubmitVerificationCode, handleSignUp, checkSignUpError } from './auth'
import Verification from './Verification'

const STAGE_INFO = 'STAGE_INFO'
const STAGE_VERIFICATION = 'STAGE_VERIFICATION'
const STAGE_AUTO_VERIFICATION = 'STAGE_AUTO_VERIFICATION'
const STAGE_REDIRECT = 'STAGE_REDIRECT'

const COUNT_DOWN_RESEND = 30
const COUNT_DOWN_REDIRECT = 5

const VERIFICATION_BY_CODE = false
const AUTO_VERIFICATION = true

export default class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      firstName: '',
      lastName: '',
      password: '',
      passwordMatch: '',
      email: '',
      code: '',
      invalidCodeMessage: '',
      errorMessage: '',
  
      stage: STAGE_INFO,
      countDown: 0,
  
    };

  }

  seconds = setInterval(() => {
    if (this.state.countDown > 0) {
      this.setState({
        countDown: this.state.countDown - 1
      })
    }
  }, 1000)

  componentWillUnmount () {
    clearInterval(this.seconds)
  }

  /// //////////////////// callback for auth lib /////////////////////
  // Callback structure here is not consistent with Login and Forget component,
  // due to the inconsistent design of aws-cognitio api: "onSuccess" vs "error"
  signUpCallback = (error, data) => {
    if (error) {
      this.setState({
        errorMessage: checkSignUpError(error)
      })
    } else {
      if (VERIFICATION_BY_CODE) {
        this.setState({
          errorMessage: '',
          stage: STAGE_VERIFICATION,
          countDown: COUNT_DOWN_RESEND
        })
      } 
      if (AUTO_VERIFICATION) {
        this.setState({
          errorMessage: '',
          stage: STAGE_AUTO_VERIFICATION,
          countDown: COUNT_DOWN_REDIRECT
        })
      }  
        else { // verification by link
        this.setState({
          errorMessage: '',
          stage: STAGE_REDIRECT,
          countDown: COUNT_DOWN_REDIRECT
        })
      }
    }
  }

  verificationCallback = (error, data) => {
    if (error) {
      this.setState({
        errorMessage: 'Invalid verification code.'
      })
    } else {
      this.setState({
        errorMessage: '',
        stage: STAGE_REDIRECT,
        countDown: COUNT_DOWN_REDIRECT
      })
    }
  }

  resendCodeCallback = (error, result) => {
    if (error) {
      this.setState({
        errorMessage: 'Resend code fail. Please retry.'
      })
    } else {
      this.setState({
        errorMessage: '',
        countDown: COUNT_DOWN_RESEND
      })
    }
  }

  /// //////////////////////// button ////////////////////////
  handleSubmit = () => {
    const { name, firstName, lastName, email, password, passwordMatch } = this.state
    if (!name || !email || !firstName || !lastName || !password || !passwordMatch) {
      this.setState({
        errorMessage: 'Please fill all fields in the form below.'
      })
    } else if (!checkNamePattern(name) || !checkEmailPattern(email) || !checkPasswordPattern(password) || !this.checkPasswordMatch()) {
      this.setState({
        errorMessage: 'Invalid input.'
      })
    }
      else {
        handleSignUp(
          this.state.email,
          this.state.password,
          this.state.name,
          this.state.firstName,
          this.state.lastName,
          'admin',
          'active',
          this.signUpCallback
        )
    }
  }

  handleSubmitVerification = () => {
    if (!this.state.code) {
      this.setState({
        errorMessage: 'Code cannot be empty.'
      })
    } else {
      handleSubmitVerificationCode(this.state.email, this.state.code, this.verificationCallback)
    }
  }

  handleResendVerification = () => {
    this.setState({
      countDown: COUNT_DOWN_RESEND
    })
    handleResendVerificationCode(this.state.email, this.resendCodeCallback)
  }

  /// ///////////////////// render /////////////////////////

  checkPasswordMatch = () => {
    return this.state.password === this.state.passwordMatch
  }

  renderErrorMessage = (message) => {
    return (
      <Message negative style={{textAlign: 'left'}}>
        Error: { message }
      </Message>
    )
  }

  renderInfo = () => {
    const { errorMessage, name, email, firstName, lastName, password, passwordMatch } = this.state
    return (
      <div>
        <Grid 
          stackable
          textAlign='center'
          style={{ marginTop: 120 }}
          verticalAlign='middle'
        >
          <Grid.Column style={{padding: '20px'}} verticalAlign='top' textAlign='left' width={6}>
            <List>
              <List.Item style={{padding: '20px 0px'}}>
                <List.Icon size='big' color='blue' style={{paddingRight: '24px'}} name='eye' />
                <List.Content>
                  <List.Header style={{ fontSize: '2em', marginBottom: '15px', lineHeight: '26px' }}>AI-powered auto-tagging</List.Header>
                  <List.Description style={{ fontSize: '1.33em', color: 'rgba(0,34,51,.4)', lineHeight: '26px' }}>Our image recognition technology automatically tags your images using object, scene, and activity detection.</List.Description>
                </List.Content>
              </List.Item>
              <List.Item style={{padding: '20px 0px'}}>
                <List.Icon size='big' color='blue' style={{paddingRight: '24px'}} name='tasks' />
                <List.Content>
                  <List.Header style={{ fontSize: '2em', marginBottom: '15px', lineHeight: '26px' }}>Simple and secure file storage</List.Header>
                  <List.Description style={{ fontSize: '1.33em', color: 'rgba(0,34,51,.4)', lineHeight: '26px' }}>
                    All your images and files are securly hosted in the cloud. Powered by Amazon Web Services.
                  </List.Description>
                </List.Content>
              </List.Item>
              <List.Item style={{padding: '20px 0px'}}>
                <List.Icon size='big' color='blue' style={{paddingRight: '24px'}} name='search' />
                <List.Content>
                  <List.Header style={{ fontSize: '2em', marginBottom: '15px', lineHeight: '26px' }}>Full text search</List.Header>
                  <List.Description style={{ fontSize: '1.33em', color: 'rgba(0,34,51,.4)', lineHeight: '26px' }}>Powerful search lets you use keywords and dynamic filters to quickly find all your files.</List.Description>
                </List.Content>
              </List.Item>
              <List.Item style={{padding: '20px 0px'}}>
                <List.Icon size='big' color='blue' style={{paddingRight: '24px'}} name='world' />
                <List.Content>
                  <List.Header style={{ fontSize: '2em', marginBottom: '15px', lineHeight: '26px' }}>Access files anywhere</List.Header>
                  <List.Description style={{ fontSize: '1.33em', color: 'rgba(0,34,51,.4)', lineHeight: '26px' }}>Access all your digital assets from any device, anywhere.</List.Description>
                </List.Content>
              </List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={6} textAlign='center' verticalAlign='middle'>
            { errorMessage && this.renderErrorMessage(errorMessage) }
            <Form size='large'>
              <Segment padded='very' style={{backgroundColor: '#fafafa'}}>
                <Header as='h2' color='blue' textAlign='center' style={{marginBottom: '20px'}}>
                  Sign Up
                </Header>
                <Header as='h3' color='grey' textAlign='center' style={{marginBottom: '20px'}}>
                  
                </Header>
                <Form.Input
                  size='big'
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='First Name'
                  onChange={(event) => this.setState({firstName: event.target.value.trim(), errorMessage: ''})}
                />
                { firstName && !checkNamePattern(firstName) && this.renderErrorMessage('Invalid first name')}

                 <Form.Input
                  size='big'
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='Last Name'
                  onChange={(event) => this.setState({lastName: event.target.value.trim(), errorMessage: ''})}
                />
                { lastName && !checkNamePattern(lastName) && this.renderErrorMessage('Invalid username')}

                <Form.Input
                  size='big'
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='Username'
                  onChange={(event) => this.setState({name: event.target.value.trim(), errorMessage: ''})}
                />
                { name && !checkNamePattern(name) && this.renderErrorMessage('Invalid username')}

                <Form.Input
                  size='big'
                  fluid
                  icon='mail'
                  iconPosition='left'
                  placeholder='E-mail address'
                  onChange={(event) => this.setState({email: event.target.value.trim(), errorMessage: ''})}
                />
                { email && !checkEmailPattern(email) && this.renderErrorMessage('Invalid email format')}

                <Form.Input
                  size='big'
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password'
                  onChange={(event) => this.setState({password: event.target.value.trim(), errorMessage: ''})}
                />
                { password && !checkPasswordPattern(password) && this.renderErrorMessage(MSG_PASSWORD_PATTERN)}

                <Form.Input
                  size='big'
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password Confirm'
                  type='password'
                  onChange={(event) => this.setState({passwordMatch: event.target.value.trim(), errorMessage: ''})}
                />
                { password && passwordMatch && !this.checkPasswordMatch() && this.renderErrorMessage('Password does not match')}
                <Button style={{marginTop: '30px'}} color='blue' fluid size='large' onClick={this.handleSubmit}>Get Started</Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    )
  }

  renderVerification = () => {
    return (
      <Verification
        errorMessage={this.state.errorMessage}
        countDown={this.state.countDown}
        onChange={(event) => this.setState({code: event.target.value.trim(), errorMessage: ''})}
        onValidate={this.handleSubmitVerification}
        onResendCode={this.handleResendVerification}
      />
    )
  }

  renderRedirect = () => {
    if (this.state.countDown > 0) {
      return (
        <Grid
          textAlign='center'
          style={{ marginTop: 120 }}
          verticalAlign='middle'
        >
          <Message success style={{textAlign: 'left'}}>
            { VERIFICATION_BY_CODE && <p> Your registration has been successful. </p> }
            { AUTO_VERIFICATION && <p> Your registration has been successful. </p> }
            { !VERIFICATION_BY_CODE && !AUTO_VERIFICATION && <p> Please check your email and click the link to verify your email. </p> }
            <p> Redirecting to login page in {this.state.countDown} seconds. </p>
          </Message>
        </Grid>
      )
    } else {
      clearInterval(this.seconds)
      return <Redirect to='/login' />
    }
  }

  render = () => {
    return (
      <div>
        { this.state.stage === STAGE_INFO && this.renderInfo() }
        { this.state.stage === STAGE_VERIFICATION && this.renderVerification() }
        { this.state.stage === STAGE_REDIRECT && this.renderRedirect()}
        { this.state.stage === STAGE_AUTO_VERIFICATION && this.renderRedirect()}
      </div>
    )
  }
}
