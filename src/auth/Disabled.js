import React, { Component } from 'react'
import { Segment, Button, Form, Grid, Header, Message } from 'semantic-ui-react'
import { CONFIG } from '../utility/config';

export default class Disabled extends Component {

  render () {
    return (
      <div>
        <Grid
          textAlign='center'
          style={{ marginTop: 120 }}
          verticalAlign='middle'
        >
          <Grid.Column style={{ width: 450 }} verticalAlign='middle'>
            <Form size='large'>
              <Segment padded='very' style={{backgroundColor: '#fafafa'}}>
                <Header as='h4' textAlign='left'>
                  Your account is currently disabled!
                </Header>
                <Message negative style={{textAlign: 'left'}}>
                  Please email <a href={`mailto:${CONFIG.supportEmail}?subject=Disabled Account`}>{CONFIG.supportEmail}</a> to reactivate your account.  
                </Message>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}
