# Lazy Loading Image

## Part 1

### Abstract

In this mini-series consisting of two posts I will build a _React Component Image_ which, using **custom hooks**, shows a low-resolution image that is immediately replaced when the high-resolution counterpart is completely downloaded. In the second phase, I will take care of postponing the download of the second only when the component becomes visible.

![demo](/demo/demo-serious.gif)

### Show me

Repo [here](https://github.com/didof/lazy-loading-with-hooks)

### Table of content

1. Low-resolution & High Resolution
2. High-resolution only when is visible

---

## Low-resolution & High-resolution

#### Concept

The rendering of a high-resolution image can take - especially for slow connections - several seconds. This lack of readiness results in _worse UX_.

In this post, I deal with solving the problem by building a component that in addition to the high-resolution image source receives one for the low-resolution image to be shown as a replacement until the first is fully downloaded and available.

In the next post, I will take care of postponing the download of the high-resolution image only when the component becomes visible within the view. Regardless, the user will not see a missing image as the relative low resolution will already be present.

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

At this point on the screen, there is the image related to `srcTuple[0]` (the low-resolution source) because that is what the style wants. For the replacement to occur, it is necessary to be able to intervene when the download of the high-resolution image is completed.

To do this I can use the `onLoad` method of the`<img>` attribute. The explanatory name indicates when it is performed.

The question remains of what to actually make it perform.

---

With a view to **modern React**, I decided to opt for a **custom hook**.
It must keep track of the state of the image loading and on the basis of it return a style that leads to a pleasant transition between the two images of the component. To do this it must expose a method that will be associated with the `onLoad` method.

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

![pulp fiction demo](/demo/demo-pulp.gif)

Considerations:

Given the very little use of the network in this demo, to make the effect more appreciable it can be convenient

- multiply the number of `<Image />` components and their contents
- simulate throttling in the Network tab of the Developer Tools
- disable cache

Finally, it is true that compared to a simple `<img />` with a single source, `<Image />` requires a few more bytes to be downloaded (AKA the low-resolution image). However, it's a small price to pay for a better UX, it's so true?

---

## Part 2

### Recap

In the previous post, I built a React component Image that receives two sources, one for a low-resolution version of the image and one for the high-resolution one. Shows the former, which is promptly replaced by the latter as soon as its download is complete.

### Abstract

A further performance improvement is to start the download of the high-resolution image only when the component is in view.
Still, with a view to **modern React**, I build a custom hook which, having received a ref associated with an HTML element, uses the **IntersectionObserver API** to evaluate if the element is in view

### Process

I add the hook in the appropriate folder built previously

```bash
touch src/hooks/useIntersectionObserver.js
```

The **IntersectionObserver** must be instantiated in a `useEffect` whose execution depends on the` elementRef` that the hook receives as an argument. This is necessary for the functionality of the hook to be responsive if a different ref is conditionally provided during use

One way to proceed is to bind the **IntersectionObserver** to a `ref` declared in the hook itself. In this way, at the unmount of the component using the hook, React will take care of the clean up of the aforementioned `ref`

In the **IntersectionObserver** callback it is sufficient to set the entry that is observed. This makes it easy to find outside the `useEffect`

###### useIntersectionObserver.js

```js
import { useRef, useEffect, useState } from 'react'

const useIntersectionObserver = elementRef => {
  const observer = useRef()
  const [entry, setEntry] = useState()

  const options = {
    threshold: 0.1,
    root: null,
    rootMargin: '0%',
  }

  const updateEntry = entries => {
    setEntry(entries[0])
  }

  useEffect(() => {
    const node = elementRef?.current
    if (!node) return

    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(updateEntry, options)

    const { current: currentObserver } = observer

    currentObserver.observe(node)

    return () => currentObserver.disconnect()
  }, [elementRef])

  return { isVisible: !!entry?.isIntersecting, entry }
}

export default useIntersectionObserver
```

A _boolean_ is returned indicating the presence or absence of the component in the view

> There are two `observer.current.disconnect ()`. The first is executed only if the observer was already active but under observation on a different `elementRef`. In the second case, the disconnection occurs in the cleanup phase of the `useEffect` which, by extension, uniquely corresponds to the moment in which the component that makes use of the hook is removed from the DOM

<a></a>

> For the purposes of this demo the hook always refers to the whole view. However, it is not difficult to take a second `options` argument and pass it into the ** IntersectionObserver ** instance (remember to add it to the` useEffect` dependencies)

---

The use in the `<Image>` component (the same as in the previous post) is immediate. I declare a ref (`imageRef`) and bind it to the root element of the component (` div.wrapper`). The same ref is supplied to the `useIntersectionObserver` hook which returns `isVisible`

Conditionally showing the second `<img>` tag, that is the one associated with the high-resolution image, you will get that the feature implemented in the previous post is used only when the element enters view. In the meantime, the user is shown the low-resolution image

###### Image.js (\* per indicare le modifiche dal precedente)

```jsx
import { useRef } from 'react'
import useImageOnLoad from '../hooks/useImageOnLoad'
import useIntersectionObserver from '../hooks/useIntersectionObserver'

const Image = ({ width = '100%', height = '100%', lowResSrc, highResSrc }) => {
  const { handleImageOnLoad, transitionStyles } = useImageOnLoad()

  const imageRef = useRef() // *
  const { isVisible } = useIntersectionObserver(imageRef) // *

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
    <div style={styles.wrapper} ref={imageRef}>
      <img src={lowResSrc} style={lowResStyle} />
      {isVisible && ( // *
        <img
          src={highResSrc}
          style={hightResStyle}
          onLoad={handleImageOnLoad}
        />
      )}
    </div>
  )
}

export default Image
```

The simplest way to check if the desired effect is present is to move the image outside the view

###### App.js (detail)

```jsx
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
```

From the Network tab of the Developer Tools, you can see how the low-resolution image download is performed as soon as possible. On the other hand, that of the high-resolution image is started only when the component is in view

![intersection observer demo](/demo/demo-intersection-observer.gif)

---

If you like it, let's get in touch
[Twitter](https://twitter.com/did0f)
[Linkedin](https://www.linkedin.com/in/francesco-di-donato-2a9836183/)
