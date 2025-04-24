import rss from '@astrojs/rss';
import { getNotes, getTypeForNote } from '../components/Notes.astro';
import { renderStars } from '../components/StarRating.astro';

import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export async function GET(context) {
  const notes = (
    await getNotes({ keepIf: (note) => 
      note.props.frontmatter?.title?.length > 0 && 
      note.params.pubDate?.length > 0 && 
      !/readme.md$/.test(note.props.file) && 
      !/^_/.test(note.props.file.split('/').pop()) &&
      new Date(note.params.pubDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    })
  );

  return rss({
    title: 'puf.io',
    description: 'All notes and thoughts by puf',
    site: context.site,
    items: notes.map((note) => {
      const type = getTypeForNote(note.props);
      console.log(note.props.file);
      let title = note.props.frontmatter.title;
      if (type === 'books') {
        title += ` - ${note.props.frontmatter.author} (Rating: ${renderStars(note.props.frontmatter?.rating)})`;
      }
      let item = {
        title: title,
        link: note.params.slug,
        pubDate: note.params.pubDate,
        description: note.props.frontmatter?.description,
      };
      if (!item.description || item.description.length === 0) {
        try {
          let content;
          if (note.props.file.endsWith('.mdx')) {
            // TODO: get the renderable (or maybe unrendered) content
            content = sanitizeHtml(note.props.compiledContent(), {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
            });
          } else {
            content = sanitizeHtml(parser.render(note.props.compiledContent()), {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
            });
          }
          if (content.length < 50_000) {
            item.description = content + "\n\n";
          }
          else {
            console.warn(`Skipping content for ${note.params.slug} in feed.xml, as it's too long (${content.length} chars)`);
          }
        } catch (e) {
          // Note: by catching the error, we still include the item but without its main content
          console.error(`Failed to sanitize content for ${note.params.slug}`, e);
        }
      }
      return item;
    }),
    customData: `<language>en-us</language>`,
  });
}