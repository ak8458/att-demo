export default function decorate(block) {
  const link = block.querySelector('a')?.href || block.textContent.trim();
  
  if (link.includes('youtube.com') || link.includes('youtu.be')) {
    const videoId = link.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/)?.[1];
    if (videoId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.width = '100%';
      iframe.style.aspectRatio = '16/9';
      iframe.style.border = 'none';
      block.textContent = '';
      block.appendChild(iframe);
    }
  }
}
