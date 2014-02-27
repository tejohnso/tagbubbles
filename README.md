#tagbubbles

This will fetch html from a url via server-side client request using
[Node.js](http://nodejs.org).

A list of the retrieved html tag occurences will be shown in tabular and visual format.
Visualization is implemented using [D3.js](http://d3js.org).

###Installation

```
npm install
node web.js
```

then browse to localhost:3000

###Tests
```
casperjs test tests/
```
The tests will confirm:
- local http connection response
- input field is present
- input field has default focus on page load
- a number of different html tags are found
