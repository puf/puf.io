---
title: Firestore document count estimator
pubDate: "Aug 14, 2025"
alsoOn: []
tags: [firestore, firebase]
---
If you use Firestore's built-in `add` method, you can get a rough estimate of the number of documents in a collection by providing a relatively small number of consecutive document IDs.[^1]

Follow these steps to got an "order of magnitude" estimation of the number of documents in a large collection[^2]:

1. We need to get the first 100-200[^3] document IDs in the collection.
1. Go to the <a href="https://console.firebase.google.com/project/_/firestore/databases/-default-/data/?view=query-view&query=1%7CLIM%7C3%2F200&scopeType=collection&scopeName=%2Flogs">Firestore query builder</a>
2. Hide all fields from the results, which leads just the document ID[^4]
3. Drag while holding the mouse button to select all document IDs, and copy them
4. Paste the document IDs below
5. Tab out of or click outside the text area

<textarea rows=10 cols="40">    
</textarea>

Based on the <span id="count"></span> values above there are an estimated <span id="estimate">???</span> documents in the collection (group).

[^1]: I first learnt about this approach from original Firestore product manager Dan McGrath, but I can't find any write-up of his about it.

[^2]: To learn more about this approach, see <a href="https://jfhr.me/estimate-firestore-collection-count/">Estimate Firestore collection count from a small sample of documents</a> where I also got most of the code that this page uses. Thanks jfhr! 🙏

[^3]: For a collection with 22,833 the estimate based on the first 100 IDs was 19,155 documents (so off by 17%). With 200 IDs the estimate became 20,326 document (so off by 11%). Both are a bit further off than I recalled, but well within range for my needs - YMMV of course

[^4]: On Datastore (and Firestore and Datastore more) this sort of [keys-only query](https://cloud.google.com/datastore/pricing#small_operations) can be performed for the cost of one entity read, but Firestore in native mode unfortunately doesn't have such an option (yet).

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
  try {
  let text = input.value;
  let lines = text.split('\n').map((l) => l.trim()).filter(l => l.length > 0);
  console.log('lines', lines);
  count.innerText = lines.length;
  let estimate = estimateN(lines);
  console.log('estimate', estimate);
  output.innerText = estimate.toLocaleString();
  }
  catch (e) {
    console.error(`Error parsing input`, input.value);
    alert('Error parsing input. Make sure that you only paste document IDs, one per line');
  }
});
</script>