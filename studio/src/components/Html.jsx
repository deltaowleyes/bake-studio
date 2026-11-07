/* Shows a small piece of generated artwork (an SVG or <img> string from Art/Render) inside the studio,
   e.g. logo options and image thumbnails. Never used for whole generated pages. */
export default function Html({ html, as: Tag = 'span', ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html || '' }} />;
}
