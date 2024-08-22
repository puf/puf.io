import rss from '@astrojs/rss';
import { getNotes } from '../components/Notes.astro';

export async function GET(context) {
  const notes = await getNotes({ keepIf: (note) => note.props.frontmatter?.title?.length > 0 && note.params.pubDate?.length > 0 && !/readme.md$/.test(note.props.file) });

  console.log("Notes for RSS", notes);

  return rss({
    title: 'puf.io',
    description: 'All notes and thoughts by puf',
    site: context.site,
    items: notes.map((note) => {
      return {
        title: note.props.frontmatter.title,
        description: note.content, // TODO: there's nothing here yet
        link: note.params.slug,
        pubDate: note.params.pubDate,
      };
    }),
    customData: `<language>en-us</language>`,
  });
}