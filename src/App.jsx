import ImageIO from './components/ImageIO'

const srcTuple = [
  'https://i.ebayimg.com/images/g/nGQAAOSwHoFe4Kb3/s-l300.jpg',
  'https://media1.tenor.com/images/aa2ae6319d58764aa8efaefaa61f8da7/tenor.gif',
]

const App = () => {
  return (
    <div style={{ position: 'relative', height: '200vh' }}>
      <div style={{ position: 'absolute', bottom: 0 }}>
        <ImageIO
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
