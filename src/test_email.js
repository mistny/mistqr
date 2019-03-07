'use strict';
const path = require('path');
const email = require(path.join(__dirname, 'email.js'));

email.send(
    'alisaad012@gmail.com',
    'Testing Node.js',
    'Click to confirm!',
    '<html><head><style>a{font-weight:bold}</style></head><body>Click <a href="https://google.com">here</a> to confirm.<script>document.querySelector("a").style.textDecoration = "none"</script></body></html>',
    (info) => {console.log('Call back', info)}
);

console.log('After send()');