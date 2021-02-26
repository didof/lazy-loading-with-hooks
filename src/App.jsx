import ImageIO from './components/ImageIO'

const srcTuplePulp = [
  'https://static.hollywoodreporter.com/sites/default/files/2015/02/pulp_fiction_a_h.jpg',
  'https://media.giphy.com/media/6uGhT1O4sxpi8/giphy.gif',
]

const srcTupleSerious = [
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/600',
]

const App = () => {
  const srcTuple = srcTuplePulp

  return (
    <div style={{ position: 'relative', height: '200vh' }}>
      <div style={{ position: 'absolute', bottom: 0 }}>
        <Image
          width={600}
          height={400}
          lowResSrc={srcTuple[0]}
          highResSrc={srcTuple[1]}
        />
      </div>
    </div>
  )
}

export default App
