import React from 'react'
import { Button, Header, Image, Modal } from 'semantic-ui-react'
import { getInfo } from '../utility/photos';

class EditItem extends React.Component{ 
  constructor(props) {
    super(props)

    this.state = {
      key: props.id,
      data: props.getInfo
    }
    console.log(this.state);
  };

  componentWillMount() {
    if(this.state.key !== null) {
      getInfo(this.props.id).then((data) => {
        return data;
      });
    }
  }

  render() {

    return (
      <Modal open={this.props.open}>
        <Modal.Header>Select a Photo</Modal.Header>
        <Modal.Content image>
          <Image wrapped size='medium' src='/assets/images/avatar/large/rachel.png' />
          <Modal.Description>
            <Header>Default Profile Image</Header>
            <p>We've found the following gravatar image associated with your e-mail address.</p>
            <p>Is it okay to use this photo?</p>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    )
  }
}

export default EditItem
