import rss from '@astrojs/rss';
import { getNotes, getTypeForNote } from '../components/Notes.astro';
import { renderStars } from '../components/StarRating.astro';

// import sanitizeHtml from 'sanitize-html';
// import MarkdownIt from 'markdown-it';
// const parser = new MarkdownIt();

export async function GET(context) {
  const notes = await getNotes({ keepIf: (note) => note.props.frontmatter?.title?.length > 0 && note.params.pubDate?.length > 0 && !/readme.md$/.test(note.props.file) });

  console.log("Notes for RSS", notes);
  console.log("Notes with description: ", notes.filter((note) => note.props.frontmatter?.description).map((note) => note.props.Content));

  return rss({
    title: 'puf.io',
    description: 'All notes and thoughts by puf',
    site: context.site,
    items: notes.map((note) => {
      const type = getTypeForNote(note.props);
      let title = note.props.frontmatter.title;
      if (type === 'books') {
        title += ` - ${note.props.frontmatter.author} (Rating: ${renderStars(note.props.frontmatter?.rating)})`;
      }
      return {
        title: title,
        link: note.params.slug,
        pubDate: note.params.pubDate,
        description: note.props.frontmatter?.description,
        //content: note.props.compiledContent,
        // content: sanitizeHtml(note.props.compiledContent, {
        //   allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
        // }) + "\n\n",
      };
    }),
    customData: `<language>en-us</language>`,
  });
}