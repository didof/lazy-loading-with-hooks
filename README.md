# Lazy Loading Image

### Abstract

In this mini series consisting of two posts I will build a _React Component Image_ which, using **custom hooks**, shows a low resolution image that is immediately replaced when the high resolution counterpart is completely downloaded. In a second phase I will take care of postponing the download of the second only when the component becomes visible.

Immagine

### Show me

Repo

Link netlify

### Table of content

1. Low Resolution & High Resolution
2. High Resolution only when is visible

---

## Low Resolution & High Resolution

#### Concept

The rendering of a high resolution image can take - especially for slow connections - several seconds. This lack of readiness results in _worse UX_.

In this post I deal with solving the problem by building a component that in addition to the high resolution image source receives one for the low resolution image to be shown as a replacement until the first is fully downloaded and available.

In the next post I will take care of postponing the download of the high resolution image only when the component becomes visible within the view. Regardless, the user will not see a missing image as the relative low resolution will already be present.

#### Process

In a project generated via `create-react-app` I delete all that is superfluous.

Then I initialize the construction of the `Image` component

```bash
mkdir src/components
touch src/components/Image.jsx
```

It is actually two `<img>` placed one above the other and made visible alternately. To make them superimposable it is sufficient to use a wrapper with the necessary _CSS properties_. Furthermore, since the two images may have different sizes, it is recommended that while a wrapper defines width and height, the images contained therein adapt to its directives.

###### Image.js

```jsx
const Image = ({ width = '100%', height = '100%', lowResSrc, highResSrc }) => {
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
    },
  }

  return (
    <div style={styles.wrapper}>
      <img src={lowResSrc} style={styles.image} />
      <img src={highResSrc} style={styles.image} />
    </div>
  )
}

export default Image
```

> Inline CSS is used rather than another solution for simplicity's sake

Now I use the component and I provide it with the required props

###### App.js (but it could be anywhere)

```jsx
const srcTuple = [
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/600',
]
```

###### App.js (detail)

```jsx
<Image
  width={300}
  height={300}
  lowResSrc={srcTuple[0]}
  highResSrc={srcTuple[1]}
/>
```

At this point on the screen there is the image related to `srcTuple[0]` (the low resolution source) because that is what the style wants. For the replacement to occur, it is necessary to be able to intervene when the download of the high resolution image is completed.

To do this I can use the `onLoad` method of the`<img>`attribute. The explanatory name indicates when it is performed.

The question remains of what to actually make it perform.

---

With a view to **modern React**, I decided to opt for a **custom hook**.
It must keep track of the state of the image loading and on the basis of it return a style that leads to a pleasant transition between the two images of the component. To do this it must expose a method which will be associated with the `onLoad` method.

```bash
mkdir src/hooks
touch src/hooks/useImageOnLoad.js
```

###### useImageOnLoad.js

```js
import { useState } from 'react'

const useImageOnLoad = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleImageOnLoad = () => setIsLoaded(true)

  const transitionStyles = {
    lowRes: {
      opacity: isLoaded ? 0 : 1,
      filter: 'blur(2px)',
      transition: 'opacity 500ms ease-out 50ms',
    },
    highRes: {
      opacity: isLoaded ? 1 : 0,
      transition: 'opacity 500ms ease-in 50ms',
    },
  }

  return { handleImageOnLoad, transitionStyles }
}

export default useImageOnLoad
```

So, just integrate the hook into the component. The method is associated with the `onLoad` on the _high resolution_ `<img>`tag. The styles returned by the hook must be associated with its `<img>` tags

###### Image.js (snellito)

```jsx
const Image = ({ ... }) => {
  const { handleImageOnLoad, transitionStyles } = useImageOnLoad()

  const styles = {...}

  const lowResStyle = { ...styles.image, ...transitionStyles.lowRes }
  const hightResStyle = { ...styles.image, ...transitionStyles.highRes }

  return (
    <div style={styles.wrapper}>
      <img src={lowResSrc} style={lowResStyle} />
      <img src={highResSrc} style={hightResStyle} onLoad={handleImageOnLoad} />
    </div>
  )
}

export default Image
```

---

// mettere gif

Considerations:

Given the very little use of the network in this demo, to make the effect more appreciable it can be convenient

- multiply the number of `<Image />` components and their contents
- simulate throttling in the Network tab of the Developer Tools
- disable cache

Finally, it is true that compared to a simple `<img />` with a single source, `<Image />` requires a few more bytes to be downloaded (AKA the low resolution image). However, it's a small price to pay for a better UX, it's so true?
