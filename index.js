const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const app = express();
const secretKey = 'mySecretKey';

const connection = mysql.createConnection({
  host: '10.60.10.5',
  user: 'fgjdesa',
  password: '$fgjDesa123',
  database: 'htsj_administrativo'
});

// Middleware para verificar el Bearer Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}

// Endpoint protegido con Bearer Token
app.get('/users', verifyToken, (req, res) => {

  const query = `
  SELECT DISTINCT e.numEmpleado, e.idEmpleado, e.rfc, e.curp, e.nombre, e.paterno, e.materno, e.claveIssemym, e.fechaIngreso, gen.desGenero, pla.idPlaza, tp.desTipoPlaza, pl.desPuestoLaboral, j.DesJuz as adscripcionActual, pe.adscripcionFisica, j.cveOrganigrama as idUnidadAdmin
  FROM tblempleados e 
  INNER JOIN tblplazaempleados pe ON pe.idEmpleado = e.idEmpleado
  INNER JOIN tblgeneros gen ON gen.cveGenero = e.cvegenero
  INNER JOIN tblplazaslaborales pla ON pe.idPlazaLaboral = pla.idPlazaLaboral
  INNER JOIN tblpuestoslaborales pl ON pe.idPuestoLaboral = pl.idPuestoLaboral
  INNER JOIN tbltiposplaza tp ON pla.cveTipoPlaza = tp.cveTipoPlaza
  INNER JOIN juzgadosgestion j ON j.IdJuzgado = pe.cveAdscripcion
  `;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});

// Endpoint para obtener el Bearer Token
app.post('/login', (req, res) => {
  // Aquí iría la lógica para autenticar al usuario y generar el token
  const user = { username: 'johndoe' };
  const token = jwt.sign(user, secretKey);

  res.json({ token });
});

app.listen(3000, () => {
  console.log('API listening on port 3000');
});