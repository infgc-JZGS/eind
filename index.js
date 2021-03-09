require('dotenv').config();
const fs = require('fs');
const ejs = require('ejs');
const axios = require('axios');
const FormData = require('form-data');
const Path = require('path');
const Bcrypt = require('bcrypt');

const fastify = require('fastify')({ ignoreTrailingSlash: true });
fastify.register(require('fastify-static'), { root: Path.join(__dirname, 'public') });
fastify.register(require('fastify-cookie'));
fastify.register(require('fastify-formbody'));



Bcrypt.compareAll = async (data, hashes) => {
  for (const hash of hashes) {
    if (await Bcrypt.compare(data, hash)) return true;
  }
  return false
}


fastify.decorateReply('view', function (path, options) {
  file = fs.readFileSync(path, 'utf-8');
  page = ejs.render(file, options);

  this.type('text/html');
  this.send(page);
});


fastify.decorate('db', async function (query) {
  const form = new FormData();
  form.append('user', process.env.DB_USER);
  form.append('pass', process.env.DB_PASS);
  form.append('db', process.env.DB_DB);
  form.append('query', query);

  const res = await axios.post('https://infgc.tk/~18v_jarcoz/olvs/', form, { headers: form.getHeaders() });
  return res.data;
});



fastify.get('/', async (request, reply) => {
  const res = await fastify.db(`SELECT * FROM logins WHERE user = '${request.cookies.user}'`);
  if (res.status == 'failed') console.log(res);
  if(res.status == 'success' && res.data.length && await Bcrypt.compareAll(request.cookies.token, res.data)) {
    reply.redirect('/feed');
  }

  reply.view(Path.join(__dirname, 'views/login.ejs'));
});


fastify.get('/feed', async (request, reply) => {
  const res = await fastify.db(`SELECT * FROM logins WHERE user = '${request.cookies.user}'`);
  if (res.status == 'failed') console.log(res);
  if(res.status == 'success' && res.data.length && await Bcrypt.compareAll(request.cookies.token, res.data)) {
    reply.view(Path.join(__dirname, 'views/feed.ejs'));
  } else {
    reply.redirect('/');
  }

  
});


fastify.post('/login', async (request, reply) => {
  const res = await fastify.db(`SELECT * FROM users WHERE username = '${request.body.username}'`);
  if(res.status == 'success' && await Bcrypt.compare(request.body.password, res.data.password)) {
    const token = Math.random().toString(16).substr(2, 16);
    //hash token
    await fastify.db(`INSERT INTO logins (user, token) VALUES ('${res.data.id}', '${hash}')`)
  }
  reply.redirect('/');
});



fastify.listen(3000, (err, addr) => {
  if (err) throw err;
  console.log(`listening on ${addr}!`);
});
