import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { Segment, Button, Form, Grid, Header, Message } from 'semantic-ui-react'
import { MSG_PASSWORD_PATTERN, checkPasswordPattern, checkEmailPattern, forgotPasswordFactoryCallback, handleForgotPassword,
         handleForgotPasswordReset } from './auth'
import Verification from './Verification'

const STAGE_INFO = 'STAGE_INFO'
const STAGE_VERIFICATION = 'STAGE_VERIFICATION'
const STAGE_REDIRECT = 'STAGE_REDIRECT'

const COUNT_DOWN_RESEND = 30
const COUNT_DOWN_REDIRECT = 5

export default class Forget extends Component {
  state = {
    stage: STAGE_INFO,
    email: '',
    password: '',
    passwordMatch: '',
    code: '',
    countDown: 0,
    errorMessage: ''
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
  forgotPasswordCallBack = forgotPasswordFactoryCallback({
    onSuccess: () => {
      this.setState({
        stage: STAGE_REDIRECT,
        countDown: COUNT_DOWN_REDIRECT
      })
    },
    onFailure: (error) => {
      this.setState({
        errorMessage: error
      })
    },
    inputVerificationCode: (data) => {
      this.setState({
        stage: STAGE_VERIFICATION,
        countDown: COUNT_DOWN_RESEND
      })
    }
  }, this);

  /// //////////////////////// button ////////////////////////
  handleSubmit = () => {
    const { email, password, passwordMatch } = this.state
    if (!email || !password || !passwordMatch) {
      this.setState({
        errorMessage: 'Please fill all fields in the form below.'
      })
    } else if (!checkEmailPattern(email) || !checkPasswordPattern(password) || !this.checkPasswordMatch()) {
      this.setState({
        errorMessage: 'Invalid input.'
      })
    } else {
      handleForgotPassword(email, this.forgotPasswordCallBack)
    }
  }

  handleSubmitVerification = () => {
    handleForgotPasswordReset(
      this.state.email,
      this.state.code,
      this.state.password,
      this.forgotPasswordCallBack
    )
  }

  handleResendVerification = () => {
    this.setState({
      countDown: COUNT_DOWN_RESEND
    })
    handleForgotPassword(this.state.email, this.forgotPasswordCallBack)
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
    const { errorMessage, email, password, passwordMatch } = this.state
    return (
      <div>
        <Grid
          textAlign='center'
          style={{ marginTop: 120 }}
          verticalAlign='middle'
        >
          <Grid.Column style={{ width: 450 }} verticalAlign='middle'>
            { errorMessage && this.renderErrorMessage(errorMessage) }
            <Form size='large'>
              <Segment padded='very' style={{backgroundColor: '#fafafa'}}>
                <Header as='h2' color='blue' textAlign='left'>
                  Reset Password
                </Header>
                <Form.Input
                  fluid
                  icon='mail'
                  iconPosition='left'
                  placeholder='E-mail address'
                  onChange={(event) => this.setState({email: event.target.value.trim(), errorMessage: ''})}
                />
                { email && !checkEmailPattern(email) && this.renderErrorMessage('Invalid email format')}

                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password'
                  onChange={(event) => this.setState({password: event.target.value.trim(), errorMessage: ''})}
                />
                { password && !checkPasswordPattern(password) && this.renderErrorMessage(MSG_PASSWORD_PATTERN)}

                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password Confirm'
                  type='password'
                  onChange={(event) => this.setState({passwordMatch: event.target.value.trim(), errorMessage: ''})}
                />
                { password && passwordMatch && !this.checkPasswordMatch() && this.renderErrorMessage('Password does not match')}
                <Button color='blue' fluid size='large' onClick={this.handleSubmit}>
                  Reset Password
                </Button>
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
            <p> Your password has been updated. </p>
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
        { this.state.stage === STAGE_REDIRECT && this.renderRedirect() }
      </div>
    )
  }
}
