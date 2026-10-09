import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getExternalLinkLabel,
  getExternalLinkType,
  normalizeBookLinks,
} from '../src/utils/externalLinks.js';

test('normalizes a legacy book link', () => {
  assert.deepEqual(
    normalizeBookLinks('https://www.goodreads.com/book/show/123', undefined),
    ['https://www.goodreads.com/book/show/123'],
  );
});

test('normalizes an alsoOn-only book review', () => {
  assert.deepEqual(
    normalizeBookLinks(undefined, [
      'https://www.goodreads.com/book/show/123',
      'https://bookhive.buzz/books/bk_example',
    ]),
    [
      'https://www.goodreads.com/book/show/123',
      'https://bookhive.buzz/books/bk_example',
    ],
  );
});

test('merges legacy and new book links without blanks or duplicates', () => {
  assert.deepEqual(
    normalizeBookLinks('https://www.goodreads.com/book/show/123', [
      '',
      'https://www.goodreads.com/book/show/123',
      'https://bookhive.buzz/books/bk_example',
    ]),
    [
      'https://www.goodreads.com/book/show/123',
      'https://bookhive.buzz/books/bk_example',
    ],
  );
});

test('recognizes BookHive URLs by hostname', () => {
  assert.equal(
    getExternalLinkType('https://bookhive.buzz/books/bk_example'),
    'bookhive',
  );
});

test('does not mistake a hostname suffix for BookHive', () => {
  assert.equal(
    getExternalLinkType('https://bookhive.buzz.example.com/books/bk_example'),
    undefined,
  );
});

test('keeps existing Goodreads recognition', () => {
  assert.equal(
    getExternalLinkType('https://www.goodreads.com/book/show/123'),
    'goodreads',
  );
});

test('uses the hostname as the visible fallback for unknown URLs', () => {
  assert.equal(
    getExternalLinkLabel('https://example.com/a-page'),
    'example.com',
  );
});
