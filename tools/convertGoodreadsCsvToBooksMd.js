const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/*
---
title: "Chip War: The Fight for the World's Most Critical Technology"
author: Chris Miller
startedDate: 'May 28, 2024'
finishedDate: 'June 6, 2024'
rating: 4
edition: Kindle
link: https://www.goodreads.com/book/show/60838950-chip-war
pageCount: 463
---
A bit dry, but lots of interesting facts about the past 60 odd years in chip development.
*/

// Function to generate markdown content for each book
function generateMarkdown(book) {
  return `---
title: "${book.Title}"
author: "${book.Author}"
startedDate: ""
finishedDate: "${book['Date Read']}"
rating: ${book['My Rating']}
edition: "${book['Binding']}"
link: "https://www.goodreads.com/book/show/${book['Book Id']}"
pageCount: ${book['Number of Pages']}
---

${book['My Review']}
`;
}

// Read the CSV file
fs.createReadStream('../goodreads_library_export.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (row['Read Count'] == 0 || row['Exclusive Shelf'] == 'Currently Reading') {
        console.log("Skipping because not finished:", row.Title)
        return;
    }

    const markdownContent = generateMarkdown(row);

    // Generate a filename-safe version of the book title
    //const filename = `${row.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    filename = `${row.Title} - ${row.Author}.md`.replace(/#/g, '').replace(/\?/g, '')

    // Write the markdown content to a file
    fs.writeFile(path.join(__dirname, 'markdown_files', filename), markdownContent, (err) => {
      if (err) {
        console.error(`Error writing file for ${row.Title}:`, err);
      } else {
        console.log(`Markdown file created for ${row.Title}`);
      }
    });
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
