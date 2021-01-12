require('colors');
const Server = require('fastify')();
const fs = require('fs');

Server.get('/', async (req, res) => {
  file = fs.readFileSync('views/test.html');
  res.type('text/html');
  res.send(file);
});

Server.listen(3000, (err, addr) => {
  if (err) throw err;
  console.log(`listening on ${addr}!`.brightGreen);
});
