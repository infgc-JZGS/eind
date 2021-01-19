const Server = require('fastify')();
const fs = require('fs');
const ejs = require('ejs');



Server.decorateReply('view', function (path, options) {
  file = fs.readFileSync(path, 'utf-8');
  page = ejs.render(file, options);

  this.type('text/html');
  this.send(page);
});



Server.get('/', async (request, reply) => {
  reply.view('views/test.html');
});

Server.get('/ip', async (request, reply) => {
  reply.view('views/test.ejs', {
    ip: request.ip,
  });
});



Server.listen(3000, (err, addr) => {
  if (err) throw err;
  console.log(`listening on ${addr}!`);
});
