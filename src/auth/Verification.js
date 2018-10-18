import React, { Component } from 'react'
import { Segment, Button, Form, Grid, Header, Message } from 'semantic-ui-react'

export default class Verification extends Component {
  renderErrorMessage (message) {
    return (
      <Message negative style={{textAlign: 'left'}}>
        Error: { message }
      </Message>
    )
  }

  render () {
    return (
      <div>
        <Grid
          textAlign='center'
          style={{ marginTop: 120 }}
          verticalAlign='middle'
        >
          <Grid.Column style={{ width: 450 }} verticalAlign='middle'>
            { this.props.errorMessage && this.renderErrorMessage(this.props.errorMessage) }
            <Form size='large'>
              <Segment padded='very' style={{backgroundColor: '#fafafa'}}>
                <Header as='h4' textAlign='left'>
                  Please check your email and enter the verification code here:
                </Header>
                <Form.Input
                  fluid
                  icon='hashtag'
                  iconPosition='left'
                  placeholder='Code'
                  onChange={this.props.onChange}
                />
                <Button color='blue' fluid onClick={this.props.onValidate}>Validate</Button>
                <div style={{marginTop: 10}} />
                { this.props.countDown > 0 && (<Button color='orange' fluid disabled>Resend code in {this.props.countDown} seconds</Button>) }
                { this.props.countDown === 0 && (<Button color='orange' fluid onClick={this.props.onResendCode}>Resend code</Button>) }
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}
