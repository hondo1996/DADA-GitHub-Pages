import { useEffect, useRef, useState } from 'react'

export default function ProjectDialog({ project, onClose }) {
  const dialogRef = useRef(null)
  const [imageIndex, setImageIndex] = useState(null)
  const move = direction => setImageIndex(index => (index + direction + project.images.length) % project.images.length)
  const closeProject = () => { dialogRef.current.close(); onClose() }

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  return <dialog ref={dialogRef} className={`project-dialog ${imageIndex !== null ? 'viewer-active' : ''}`} onCancel={event => {
    event.preventDefault()
    if (imageIndex !== null) setImageIndex(null)
    else closeProject()
  }} onKeyDown={event => {
    if (imageIndex !== null && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()
      move(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }} onClick={event => { if (event.target === event.currentTarget) closeProject() }} aria-label={project.title}>
    <div className="dialog-shell">
      <header className="dialog-bar">
        <span className="mono">{project.english.toUpperCase()}</span>
        <button className="close-button" onClick={closeProject} aria-label="关闭项目">关闭 <span>×</span></button>
      </header>
      {imageIndex === null ? <>
        <div className="project-intro">
          <div className="eyebrow">{project.category} <span>/ {String(project.images.length).padStart(2, '0')} IMAGES</span></div>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </div>
        <div className="project-gallery">
          {project.images.map((image, index) => <button className={`gallery-item ${image.width > image.height ? 'landscape' : ''}`} onClick={() => setImageIndex(index)} key={image.src} aria-label={`放大查看 ${image.name}`}>
            <img src={image.src} alt={image.name} loading="lazy" decoding="async" width={image.width} height={image.height}/>
            <span className="image-caption"><span>{image.name}</span><span>放大查看 ＋</span></span>
          </button>)}
        </div>
        <div className="gallery-end"><span className="mono">END OF PROJECT</span><button onClick={closeProject} className="outline-button">返回作品集</button></div>
      </> : <div className="image-viewer">
        <div className="viewer-toolbar"><button onClick={() => setImageIndex(null)}>返回项目</button><span className="mono">{String(imageIndex + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}</span></div>
        <img src={project.images[imageIndex].src} alt={project.images[imageIndex].name} decoding="async"/>
        <div className="viewer-controls"><button onClick={() => move(-1)} aria-label="上一张图片">上一张</button><span>{project.images[imageIndex].name}</span><button onClick={() => move(1)} aria-label="下一张图片">下一张</button></div>
      </div>}
    </div>
  </dialog>
}

