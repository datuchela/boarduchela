import { useEffect, useRef } from 'react'
import io from 'socket.io-client'
let socket

const Canvas = ({ ...rest }) => {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  var drawing = false
  var current = {
    color: 'red',
  }

  useEffect(() => {
    fetch('/api/socket')
    socket = io()
    socket.on('connect', () => {
      console.log('Connected to socket')
    })
    socket.on('drawing', onDrawingEvent)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx
  }, [])

  useEffect(() => {
    window.addEventListener('resize', onResize, false)
    onResize()
    return () => {
      window.removeEventListener('resize', onResize, false)
    }
  }, [])

  function drawLine(x0, y0, x1, y1, color, emit) {
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(x0, y0)
    ctxRef.current.lineTo(x1, y1)
    ctxRef.current.strokeStyle = color
    ctxRef.current.lineWidth = 2
    ctxRef.current.stroke()
    ctxRef.current.closePath()

    if (!emit) {
      return
    }
    var w = canvasRef.current.width
    var h = canvasRef.current.height

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
    })
  }

  function onMouseDown(e) {
    drawing = true
    current.x = e.clientX || e.touches[0].clientX
    current.y = e.clientY || e.touches[0].clientY
  }

  function onMouseUp(e) {
    if (!drawing) {
      return
    }
    drawing = false
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true)
  }

  function onMouseMove(e) {
    if (!drawing) {
      return
    }
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true)
    current.x = e.clientX || e.touches[0].clientX
    current.y = e.clientY || e.touches[0].clientY
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime()
    return function () {
      var time = new Date().getTime()

      if (time - previousCall >= delay) {
        previousCall = time
        callback.apply(null, arguments)
      }
    }
  }

  function onDrawingEvent(data) {
    var w = canvasRef.current.width
    var h = canvasRef.current.height
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color)
  }

  // make the canvas fill its parent
  function onResize() {
    canvasRef.current.width = window.innerWidth
    canvasRef.current.height = window.innerHeight
  }

  return (
    <canvas
      id="canvas1"
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOut={onMouseUp}
      onMouseMove={throttle(onMouseMove, 10)}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
      onTouchCancel={onMouseUp}
      onTouchMove={throttle(onMouseMove, 10)}
      className="border border-black"
      {...rest}
    />
  )
}

export default Canvas
