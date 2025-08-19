---
title: Firestore document count estimator
pubDate: "Aug 14, 2025"
alsoOn: []
tags: [firestore, firebase]
---
If you use Firestore's built-in `add` method, you can get a rough estimate of the number of documents in a collection[^5] by providing a relatively small number of consecutive document IDs.[^1]

Follow these steps to got an "order of magnitude" estimation of the number of documents in a large collection[^2]:

1. We need to get the first 100-200[^3] document IDs in the collection.
1. Go to the <a href="https://console.firebase.google.com/project/_/firestore/databases/-default-/data/?view=query-view&query=1%7CLIM%7C3%2F200&scopeType=collection&scopeName=%2Flogs">Firestore query builder</a>
2. Hide all fields from the results, which leads just the document ID[^4]
3. Drag while holding the mouse button to select all document IDs, and copy them
4. Paste the document IDs below (or <a href="javascript:paster()">paste some of my test data</a>)
5. Tab out of or click outside the text area

<textarea rows=10 cols="40">    
</textarea>

Based on the <span id="count"></span> values above there are an estimated <span id="estimate">???</span> documents in the collection (group).

[^1]: I first learnt about this approach from original Firestore product manager Dan McGrath, but I can't find any write-up of his about it.

[^2]: To learn more about this approach, see <a href="https://jfhr.me/estimate-firestore-collection-count/">Estimate Firestore collection count from a small sample of documents</a> where I also got most of the code that this page uses. Thanks jfhr! 🙏

[^3]: For a collection with 22,833 the estimate based on the first 100 IDs was 19,155 documents (so off by 17%). With 200 IDs the estimate became 20,326 document (so off by 11%). Both are a bit further off than I recalled, but well within range for my needs - YMMV of course

[^4]: On Datastore (and Firestore and Datastore more) this sort of [keys-only query](https://cloud.google.com/datastore/pricing#small_operations) can be performed for the cost of one entity read, but Firestore in native mode unfortunately doesn't have such an option (yet).

[^5]: While Firestore nowadays has a dedicated API for counting results, this can [in my testing](https://stackoverflow.com/q/75317067/) only handle results into the 10s of millions, and also become expensive (counting 10 million documents costs 10 thousand document reads). While the approach used in this page only gives an estimate of the document count, it as a fixed cost (of 100-200 document reads). For what counter approach to use in what scenarios, see [How to handle aggregated values in Firestore](https://stackoverflow.com/questions/77461961/how-should-i-handle-aggregated-values-in-firestore)

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
function paster() {
  input.value = `
    00eY3dFqiT207vlfDHi0
    00hTSTHtQKVLaFKMuTFq
    00iVUuHw37foBkBxkTp4
    011AUDzXH5EBGwfKjoXI
    01B41QU1hNefFRjK7iM6
    01N7y40LpDXKtpRJKzk4
    01YCrjFIlsedNWfDtrfM
    01YoQcRmdD4xIbkFjT5b
    01qqEEDepS0TFI544C3t
    02G070uw34xyiqIcnetf
    02TLuI2gz4xgm0TKpKIC
    02hYq5ufL9fif5pX7DJN
    02j8V7lrFZnQTb3PlBjk
    02nSPvxFY72siBFhEndx
    02qrOjjGzS9T0qDb9xYn
    02tRfbicNbrOoCWATKlg
    03Joa8NlUhHD13fF2Bub
    03K0HYzeEmf9JhKBEUKA
    03MwfPv33MiLfcWHPAfc
    03TQd9AdmJCNDotJKQY5
    03V0R1p5Qo7U6n47KuNG
    03pDcFsyUg07rHHFnoMQ
    03sTAUvj8s8fdVdDj3tR
    04BR9sWBUbvS6j1e1i5G
    04VdQkKjcuPMdGVXNOuD
    04fLzCbD0OWZrzV3oA7T
    04pFaPx4CABmDEeROUtk
    04ruSb2gSufOieKR6n1e
    050wRTCzqoM9mYtoUObV
    05mJs98OJgcMKBmziJJc
    05maC2r4YI8XMlvQzkah
    05nMfK60iOi0nDOTHcZQ
    05oxuFEwzQ51bklPtVch
    064YGhjtVNxurIx3v6Uj
    06D3Bbbxd3aWFeMPWxPO
    06QP1KpMozgucMJM82GE
    06XBle1zQzMG7cuBqS6m
    072ZZFhR6bDFMLpaThqu
    07CLwAIjHwJZUFxDAhbc
    07QKtMT6OsfEulJCpjSZ
    07WhKPaijFZkLx0Vp9JK
    08C7AWiQyilHWh2jvTZv
    08D3HwBp5meyflUN4rKp
    08UwUuacY4MZ9NAcbHZG
    08fLEHnYs75oM9j4Gocb
    08i8bHBpFxih54NMcNEG
    08u7tE0WT5CQ0JaR6y9q
    09J7RmFzGQMbhc9sjESp
    09MY6UM0QjdBSZZClFKY
    09hMW2UCYOY61kUIMRfe
    0A5TbFBZD9jAf8kYk0Vd
    0A5cPVxdl1wpmWA2cEdL
    0AE5BDNAMmQLem0JaLnl
    0AYEjTWiT30mpDu3pOgS
    0AhQhgP9bpe3QGE9Sr8s
    0AiXvrVKxRPZVVE7jbMW
    0BGQVoqeIqzLovHHuT0t
    0BJbhK9Wztag0jnrK2gy
    0BVvBWxLRXsDlUY0pw77
    0BZP87EGhlplY6KQHNBJ
    0Bb2Loj5mPh2jxBfTqFf
    0BtMNga1gQerJxG1hLnr
    0C0Z2qcuVRDuQhdY6ulS
    0C97ZX7gwuaxGyrSSmeA
    0CEGUh1kSVwEeTcWDG4f
    0CanBCLpN5j5kzsJpQP4
    0Ck0dKQRYgUqXLa3T1rM
    0CmtLdvx4fygGeVwiIrH
    0CrXaYuHtGphRBiU4N1J
    0DBpdwwzIfBw8miedRUt
    0DKLMawq4nUtVOgVITtY
    0DWW5OpltWycJ3Qo3CiB
    0Dow8UBhGTIweIAGWolJ
    0DuSRRB8U8KXcqLw4lVf
    0EBUlAFREekB08tvv3bX
    0EJHECy6zRXBeUhmPau7
    0EXkHYvxkFCtL3VrA5kA
    0EXrqLTE0S6UTZBM08tq
    0ElJl4s2WWnw1MPDWlN7
    0EloMVR3f1k0CJFnvAlg
    0FILwU0eiPx58wLd2hpK
    0FNiwRktNV0gBNgq4Fyt
    0FWAcM8oTUDvrXdqQuih
    0Faki0OFuG2ccfIAegVm
    0FoSdtWc9aF8BI9d3sFP
    0FqGO3gI5i5YORFgu1du
    0FqoY1pL1PeZneW1sPqC
    0Fw58wQFxSTUMCYV60WQ
    0GvXIogQBkiL6cL6g9WC
    0H07imeYEbLxP6KLiKYc
    0HNghFT5kFonPGohSant
    0HU1sXCWcclp8BOuePJQ
    0HY78muXpsWysCrNV6kt
    0HsnW8pD9kXN7eAAE3UU
    0IChjflhzT6emAmkynga
    0ITYXZs6WdybuOLsxPKY
    0IZ2ePLi8Pe5ARjcfBSX
    0Ib72XL9GZXmNSAWUssh
    0IjDuGvdymh6CPTZ8xbW
    0In8wP9i3ftbVeRtTsjF
    0Iv27dIvj9FjD4JVAwJw
    0J5FEoRAnP77r7oMerXV
    0JCFFKNaDFbmuT73hoDi
    0JCUZQXAg1EAyWOpZzPX
    0JFvyagsG5j8Yo5VUERR
    0JHIQ2j1uFJtBsaxXPdc
    0JUTHDsATeCJs8mI9qZD
    0JjBnux2RSXFC1Evq2b1
    0JjSjZLRPHBF1VXo4KJC
    0JueVIfffjbX9pqZiPtw
    0KOATBZ5XwKMGtQ9hZXh
    0KebS6j8xIDajnJr20AV
    0KfJZdObdsw9GlcmgJ4l
    0LG1m1wII6AYkOwf8eb9
    0LLsHruz0SXpOy4PwqC4
    0LSgKEu89UzOvCWmOTtW
    0LTDPycGd6bkDikRuftA
    0LUdfOIuXXmXsE50oMkh
    0LhZDYPntFyQX2RJSW3N
    0LjTcGPKNWrNGMqiTt9e
    0LreZx7kV3Z3F25gfIqp
    0M5QpSjEVJbxKod5F6ax
    0M9cLttFeM297pcLC7uE
    0MSaDBNjdSufocpijxmS
    0MdkUUWef9WAwPATmBsK
    0MgjcFOVmtNdfhfmoMyF
    0MrzlXNa3rpxYItNzVhb
    0MtUtqg8WgSG9j69xVB7
    0Mzqldo5KxGKCDlCZVv2
    0NyO8lxM2lHQ9CxCcWkE
    0O1imgeOvIacxfSkfQmc
    0O2w1iI3sRk4tgaMn4sf
    0OB5Cf9bwlvWQtU3Vlir
    0OY8KmA8ujmnuYq1DBaJ
    0Oe4aHgudQ4V92jbmJkX
    0OrTkq6Yo2DDWbOf68u7
    0OtSWtL0okawzMx4JLkA
    0P2i18puoDvZofTprCCd
    0PKOYzCLNX7r6AqUOZQK
    0POcmbG46MWF6N67W61C
    0POygqUsQro7ZyCZWiCh
    0PWLbNc3TPCiJxZgy5yU
    0PZ9hOUyoqwTjhSdZyWt
    0Paw0zg5RB6K2aHhNx57
    0PelY27x5RBzQeO8GmU8
    0PsjaG02AJGrsyKu1vrK
    0Pyw8mRCM3u4Nlwv2In5
    0Q2OxonnnzUUttchpNQI
    0QBbZr9xbvS9LZN0tsn2
    0QHeoqu2C7OrVChvKnNo
    0Qbqs4KUk5trPFLOVmB8
    0QwvuN2ls3cD9wInoQp9
    0QxHEWKdCyzll09eaFXs
    0QyDdrAa4LONoqXvxLqw
    0R5u9YivtbdnyD7Z50Jj
    0R7UthxH4ciXJrY5CQvb
    0R8NmBwlVZKhz0NgxnAz
    0RZsK3F2sd8qMJ7lXStm
    0RainBnaZviAtLeq4FrZ
    0RlzZDAOUMa1JRn62Gfx
    0RotUyLvFu4x68oFQxB9
    0RqYNqOZhWovy2y3JitI
    0RuQjMGZRTvaNZ2KQOsG
    0RvE7IJyZOK53Kpab9T7
    0SIKWXW615vQGFqHWSvH
    0SMMLZwxrYjhpYtBtWfa
    0SPWoedLRsI6Vrx0ftUD
    0ST258S00GMIZjhZ7S9p
    0SljQ7kIeF6chHgHbgZy
    0SpPGxjZLudtNJCKcL0B
    0SwTMJJtKYBw4nwXqqgR
    0SzHe0csKrCJHEEsXwfI
    0TLARswL3uonxb4Wx7ou
    0TnSpElqkfNipWcuiIte
    0UYKW15CU7ICZaVNPvPg
    0UZ4L6PzpYTIJf4FBAcA
    0UtXBMMmEkkBRIHqtjwU
    0V1D2qaNzeHD3E4NLMvk
    0VDKd2wpDYA9wYG0mksm
    0VKXxN5Q7BHXGQoiuzPg
    0VV2QKx84AYUKBBFkraT
    0VXhqcewjAB8MoXIXHEF
    0Vb6Z0UmP0Po4wOHSdcq
    0W5OL8dmlMfJvlhYPigR
    0WAU5SSr1BFuS2e9vXNn
    0WFM8U6DI2bBrddXA5BZ
    0WGuvsT703FGBRjKsKER
    0WfCXgCKe1BwPBVgSIG6
    0XFBApFMf5hZBqGax91Z
    0Xhl7CLscn31FE8akXLH
    0Xk0S7RiFdTtHgvozIxY
    0Xt9V6s7pu8pdg3DT1Mp
    0Y00CrYhNNRv0qyIeOTt
    0YD1gwkz5m2FLG4ll1eg
    0YHfyFgnXM6KWugdKXr6
    0YUF60Dps65gptcTuHw1
    0YY76db8evTaHtliUF7N
    0ZMuEggOrDHYOICwX934
    0ZgXtFjkrwEgwBVndW9l
    0Zy1SaJjoHuMMyic049u`;
  return false;
}
</script>