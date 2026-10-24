// Menampilkan SVG mentah dari prototipe (menjaga animasi maskot yang memakai class CSS).
export default function Svg({ markup, className }) {
  return <span className={className} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />;
}
