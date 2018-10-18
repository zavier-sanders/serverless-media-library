import React from 'react'
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'

const LoaderModule = ({active, text}) => (
  <div>
        <Loader active>{text}</Loader>
  </div>
)

export default LoaderModule