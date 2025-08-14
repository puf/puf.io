---
title: Firestore document count estimator
pubDate: "Aug 14, 2025"
alsoOn: []
tags: [firestore, firebase]
---
If you use Firestore's built-in `add` method, you can get a rough estimate of the number of documents in a collection by providing a relatively small number of consecutive document IDs.

First we need to get the first 100-200 document IDs in the collection, which you can do by:
  
1. Go to the <a href="https://console.firebase.google.com/project/_/firestore/databases/-default-/data/?view=query-view&query=1%7CLIM%7C3%2F200&scopeType=collection&scopeName=%2Flogs">Firestore query builder</a>
2. Hide all fields from the results, which leads just the document ID
3. Drag while holding the mouse button to select all document IDs, and copy them
4. Paste the document IDs below
5. Tab out of or click outside the text area

<textarea rows=10 cols="40">    
</textarea>

Estimated document count based on the <span id="count"></span> values above:
<span id="estimate">???</span>

To learn more about this approach, see <a href="https://jfhr.me/estimate-firestore-collection-count/">Estimate Firestore collection count from a small sample of documents</a>

I first learnt about this approach from original Firestore product manager Dan McGrath, but I can't find any write-up of his about it.

<script>
const D0 = '0'.charCodeAt(0);
const D9 = '9'.charCodeAt(0);
const DA = 'A'.charCodeAt(0);
const DZ = 'Z'.charCodeAt(0);
const Da = 'a'.charCodeAt(0);
const Dz = 'z'.charCodeAt(0);

/** Convert a base62 digit to a number */
function digit(char) {
    const d = char.charCodeAt(0);
    if (D0 <= d && d <= D9) {
        return BigInt(d - D0);
    }
    if (DA <= d && d <= DZ) {
        return BigInt(d - DA + 10);
    }
    if (Da <= d && d <= Dz) {
        return BigInt(d - Da + 36);
    }
    throw new Error('invalid base62 digit: ' + char);
}

/** Convert a base62 string to a BigInt */
function id2Number(id) {
    let n = 0n;
    for (let i = 0; i < id.length; i++) {
        n += digit(id.charAt(id.length - i - 1)) * (62n ** BigInt(i));
    }
    return n;
}

const max = id2Number('zzzzzzzzzzzzzzzzzzzz');

/**
 * Estimate the collection size from a list
 * containing the smallest few document IDs
 */
function estimateN(ids) {
    let estSum = 0n;
    for (let i = 0; i < ids.length; i++) {
        const x = id2Number(ids[i]);
        const estimate = BigInt(i) * max / x;
        estSum += estimate;
    }
    return estSum / BigInt(ids.length);
}

let input = document.getElementsByTagName('textarea')[0];
let count = document.getElementById('count');
let output = document.getElementById('estimate');
input.addEventListener('change', (e) => {
  let text = input.value;
  let lines = text.split('\n').map((l) => l.trim()).filter(l => l.length > 0);
  console.log('lines', lines);
  count.innerText = lines.length;
  let estimate = estimateN(lines);
  console.log('estimate', estimate);
  output.innerText = estimate.toLocaleString();
});
</script>