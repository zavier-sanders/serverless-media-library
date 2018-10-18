HitItem = (props) => {
  const {bemBlocks, result} = props
  let thumbImg, img, labels;
  const source = extend({}, result._source, result.highlight)
  let title = /[^/]*$/.exec(source.imageID)[0];
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
    thumbImg = 'https://s3-us-west-2.amazonaws.com/' + source.thumbnail.s3Bucket + '/' + source.thumbnail.s3Key;  
    img = `https://s3-us-west-2.amazonaws.com/${source.thumbnail.s3Bucket}/${source.s3key}`;  
  } else {
    thumbImg = 'https://s3-us-west-2.amazonaws.com/photo-sharing-backend-photorepos3bucket-19pxri1qd0s3m/assets/placeholder-image.jpg';
    img = 'https://s3-us-west-2.amazonaws.com/photo-sharing-backend-photorepos3bucket-19pxri1qd0s3m/assets/placeholder-image.jpg';
  }
  
  // console.log(result, source);
  return ( 
    
    <div>
      <Card
      style={{margin: '10px'}}
      image={thumbImg.replace('%2B','%252B').replace('%40','%2540')} 
      header={title}
      meta={collection}
      description={labels}
      // href={img}
      extra={
        <span>
          {/* <Icon name='download' /> */}
          <a onClick={this.copyLink}>
            <Icon data-link={id} name='linkify' />
          </a>
          <input type='hidden' id={id} value={img} />
        </span>
      }
      />
    </div>
  )
}