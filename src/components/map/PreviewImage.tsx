import React, { useCallback, useEffect, useRef, useState } from "react"

type PreviewImageProps = {
  src?: string
}

export const PreviewImage = ({ src }: PreviewImageProps) => {
  // `url` is the download URL for 'images/stars.jpg'

  const imgRef = useRef(null)
  // This can be downloaded directly:
  //   const xhr = new XMLHttpRequest()
  //   xhr.responseType = "blob"
  //   xhr.onload = (event: any) => {const blob = xhr.response}
  //   xhr.open("GET", src)
  //   xhr.send()

  // Or inserted into an <img> element
  //   const img = document.getElementById("myimg")
  //   img.setAttribute("src", url)

  //   function response(e) {
  //     var urlCreator = window.URL || window.webkitURL
  //     var imageUrl = urlCreator.createObjectURL(this.response)
  //     document.querySelector("#image").src = imageUrl
  //   }

  useEffect(() => {
    if (!src || !imgRef.current) return

    // var xhr = new XMLHttpRequest()
    // xhr.open("GET", "http://localhost/image.jpg")
    // xhr.responseType = "blob"
    // xhr.onload = response
    // xhr.send()

    // imgRef.current.setAttribute("src", url)

    const getImage = async () => {
      if (!src || !imgRef.current) return

      //   const myRequest = new Request(src)

      const response = await fetch(src, {
        mode: "no-cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      })
      const myBlob = await response.blob()
      const objectURL = URL.createObjectURL(myBlob)
      imgRef.current.src = objectURL
    }

    getImage()
  }, [src])

  //   const myImage = document.querySelector("img")

  //   const [imgSrc, setSrc] = useState(src)

  //   const onLoad = useCallback(() => {
  //     setSrc(src)
  //   }, [src])

  //   useEffect(() => {
  //     const img = new Image()
  //     img.src = src as string
  //     img.addEventListener("load", onLoad)
  //     return () => {
  //       img.removeEventListener("load", onLoad)
  //     }
  //   }, [src, onLoad])

  //   if (!src) return null
  if (!src) return <h6>src empty</h6>

  return <img ref={imgRef} alt={"Preview Image"} src={""} />
  //   return <img {...props} alt={imgSrc} src={imgSrc} />
}
