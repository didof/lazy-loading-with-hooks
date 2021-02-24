import useImageOnLoad from '../hooks/useImageOnLoad'

const Image = ({ width = '100%', height = '100%', lowResSrc, highResSrc }) => {
  const { handleImageOnLoad, transitionStyles } = useImageOnLoad()

  const styles = {
    wrapper: {
      position: 'relative',
      width,
      height,
    },
    image: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectPosition: 'center center',
      objectFit: 'cover',
    },
  }

  const lowResStyle = {
    ...styles.image,
    ...transitionStyles.lowRes,
  }
  const hightResStyle = {
    ...styles.image,
    ...transitionStyles.highRes,
  }

  return (
    <div style={styles.wrapper}>
      <img src={lowResSrc} style={lowResStyle} />
      <img src={highResSrc} style={hightResStyle} onLoad={handleImageOnLoad} />
    </div>
  )
}

export default Image
