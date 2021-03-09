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



fastify.decorateReply('view', function (path, options) {
  file = fs.readFileSync(path, 'utf-8');
  page = ejs.render(file, options);

  this.type('text/html');
  this.send(page);
});


fastify.decorateRequest('auth', async function () {
  const res = await fastify.db(`SELECT * FROM logins WHERE user = '${this.cookies.user}'`);
  if (res.status == 'failed') console.log(res);
  return (res.status == 'success' && res.data.length && await (async () => {
    for (const login of res.data) {
      if (await Bcrypt.compare(this.cookies.token, login.hash)) return true;
    }
    return false;
  })() )
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
  if (request.auth()) {
    reply.redirect('/feed');
  } else {
    reply.redirect('/login');
  }
});


fastify.get('/feed', async (request, reply) => {
  if (request.auth()) {
    reply.view(Path.join(__dirname, 'views/feed.ejs'));
  } else {
    reply.redirect('/');
  }  
});


fastify.get('/login', async (request, reply) => {
  if (!request.auth()) {
    reply.view(Path.join(__dirname, 'views/login.ejs'));
  } else {
    reply.redirect('/feed');
  }
})


fastify.post('/login', async (request, reply) => {
  const res = await fastify.db(`SELECT * FROM users WHERE username = '${request.body.username}'`);
  if(res.status == 'success' && await Bcrypt.compare(request.body.password, res.data[0].password)) {
    const token = Math.random().toString(16).substr(2, 16);
    const hash = await Bcrypt.hash(token, 8);

    const insert = await fastify.db(`INSERT INTO logins (user, hash) VALUES ('${res.data[0].id}', '${hash}')`);
    console.log(insert);

    // cookieOptions = {};
    // if (request.body.keep) cookieOptions.maxAge = 3600*24*365;
    reply.setCookie('user', res.data[0].id);
    reply.setCookie('token', token);
    reply.redirect('/feed');
  } else {
    reply.view(Path.join(__dirname, 'views/login.ejs'));
  }
});


fastify.get('/signup/:code', async (request, reply) => {
  reply.view(Path.join(__dirname, 'views/signup.ejs'));
})


fastify.post('/signup/:code', async (request, reply) => {
  const res = await fastify.db(`SELECT * FROM codes WHERE code = '${request.params.code}'`);
  if (res.status == 'success' && res.data.length) {
    if (request.body.password != request.body.passwordverify) {
      reply.view(Path.join(__dirname, 'views/signup.ejs'));
    } else {
      const hash = await Bcrypt.hash(request.body.password, 8);
      await fastify.db(`INSERT INTO users (username, fullname, password, type) VALUES ('${request.body.username}', '${res.data[0].fullname}', '${hash}', '${res.data[0].type}')`);
      reply.redirect('/login');
    }
  }
});



fastify.listen(3000, (err, addr) => {
  if (err) throw err;
  console.log(`listening on ${addr}!`);
});
