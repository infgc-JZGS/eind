const Server = require('fastify')();
const fs = require('fs');
const ejs = require('ejs');

Server.get('/', async (request, reply) => {
  page = fs.readFileSync('views/test.html', 'utf-8');
  reply.type('text/html');
  reply.send(page);
});

Server.get('/ip', async (request, reply) => {
  file = fs.readFileSync('views/test.ejs', 'utf-8');
  page = ejs.render(file, {
    ip: request.ip,
  });

  reply.type('text/html');
  reply.send(page);
});

Server.listen(3000, (err, addr) => {
  if (err) throw err;
  console.log(`listening on ${addr}!`);
});
