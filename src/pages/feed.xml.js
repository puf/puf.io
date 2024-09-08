import rss from '@astrojs/rss';
import { getNotes } from '../components/Notes.astro';
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
      return {
        title: note.props.frontmatter.title,
        //description: note.content, // TODO: there's nothing here yet
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