const Axios = require('axios');
const FormData = require('form-data');
(async () => {
  const form = new FormData();
  form.append('user', '18v_jarcoz');
  form.append('pass', 'zgsoqx');
  form.append('db', '18v_jarcoz_ned2');
  form.append('query', 'SELECT * FROM texts');

  const res = await Axios.post('https://infgc.tk/~18v_jarcoz/olvs/', form, {
    headers: form.getHeaders()
  })
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
})();
