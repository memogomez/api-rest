const express = require('express')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const app = express()
const secretKey = 'mySecretKey'

const connection = mysql.createConnection({
  host: '10.210.4.114',
  user: 'siappuser',
  password: 'Tzj6g4Sc$f0NRtB',
  database: 'htsj_administrativo'
})

// Middleware para verificar el Bearer Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user
    next()
  })
}

// Endpoint protegido con Bearer Token
app.get('/users', verifyToken, (req, res) => {
  const query = `
  SELECT DISTINCT e.numEmpleado, e.idEmpleado, e.rfc, e.curp, e.nombre, REPLACE(e.paterno, '�', 'Ñ') as paterno,  REPLACE(e.materno, '�', 'Ñ') as materno, 
  e.claveIssemym, e.fechaIngreso, gen.desGenero, pla.idPlaza, tp.desTipoPlaza, pl.desPuestoLaboral, e.numIfe, e.correoInstitucional, 
  j.DesJuz as adscripcionActual, k.DesJuz as adscripcionFisica, j.cveOrganigrama as idUnidadAdmin
  FROM tblempleados e 
  left JOIN tblplazaempleados pe ON pe.idEmpleado = e.idEmpleado
  left JOIN tblgeneros gen ON gen.cveGenero = e.cvegenero
  left JOIN tblplazaslaborales pla ON pe.idPlazaLaboral = pla.idPlazaLaboral
  left JOIN tblpuestoslaborales pl ON pe.idPuestoLaboral = pl.idPuestoLaboral
  left JOIN tbltiposplaza tp ON pla.cveTipoPlaza = tp.cveTipoPlaza
  left JOIN juzgadosgestion j ON j.IdJuzgado = pe.cveAdscripcion
  left JOIN juzgadosgestion k ON k.IdJuzgado = pe.adscripcionFisica
  where e.cveEstatusEmpleado in (1,7)
  and e.activo = 'S'
  and pe.activo = 'S'
  and pe.vigente = 'S'
  `

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error.message)
    } else {
      res.json(results)
    }
  })
})

app.get('/completo', verifyToken, (req, res) => {
  const query = `
  SELECT DISTINCT (e.numEmpleado), e.idEmpleado, e.rfc, e.curp, e.nombre,  REPLACE(e.paterno, '�', 'Ñ') as paterno,  REPLACE(e.materno, '�', 'Ñ') as materno, 
  e.claveIssemym, e.fechaIngreso, e.numIfe, e.correoInstitucional, e.activo,
  gen.desGenero,
  (select t4.desTipoPlaza  from tblempleados t 
  left join tblplazaempleados t2 on t.idEmpleado = t2.idEmpleado
  left join tblplazaslaborales t3 on t2.idPlazaLaboral = t3.idPlazaLaboral  
  left join tbltiposplaza t4 on t3.cveTipoPlaza  = t4.cveTipoPlaza 
  where t2.idPlazaEmpleado = (select max(idPlazaEmpleado) from tblplazaempleados 
  where idEmpleado=e.idEmpleado)) desTipoPlaza,
  (select t3.idPlaza from tblempleados t 
  left join tblplazaempleados t2 on t.idEmpleado = t2.idEmpleado 
  left join tblplazaslaborales t3 on t2.idPlazaLaboral = t3.idPlazaLaboral 
  where t2.idPlazaEmpleado = (select max(idPlazaEmpleado) from tblplazaempleados 
  where idEmpleado=e.idEmpleado)) idPlaza,
  (select t3.desPuestoLaboral  from tblempleados t 
  left join tblplazaempleados t2 on t.idEmpleado = t2.idEmpleado 
  left join tblpuestoslaborales t3 on t2.idPuestoLaboral  = t3.idPuestoLaboral  
  where t2.idPlazaEmpleado = (select max(idPlazaEmpleado) from tblplazaempleados where idEmpleado=e.idEmpleado)) desPuestoLaboral, 
  (select DesJuz from tblplazaempleados t 
  left JOIN juzgadosgestion j ON j.IdJuzgado = t.cveAdscripcion
  where t.idPlazaEmpleado = (select max(idPlazaEmpleado) 
  from tblplazaempleados where idEmpleado=e.idEmpleado)) adscripcionActual,
  (select DesJuz from tblplazaempleados t 
  left JOIN juzgadosgestion j ON j.IdJuzgado = t.cveAdscripcion
  where t.idPlazaEmpleado = (select max(idPlazaEmpleado) 
  from tblplazaempleados where idEmpleado=e.idEmpleado)) idUnidadAdmin,
  (select DesJuz from tblplazaempleados t 
  left JOIN juzgadosgestion j ON j.IdJuzgado = t.adscripcionFisica 
  where t.idPlazaEmpleado = (select max(idPlazaEmpleado) 
  from tblplazaempleados where idEmpleado=e.idEmpleado)) adscripcionFisica
  FROM tblempleados e 
  left JOIN tblgeneros gen ON gen.cveGenero = e.cvegenero
  `

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error.message)
    } else {
      res.json(results)
    }
  })
})

app.get('/user/:parametro', verifyToken, (req, res) => {
  const parametro = req.params.parametro
  const query = `
  SELECT DISTINCT e.numEmpleado, e.idEmpleado, e.rfc, e.curp, e.nombre,  REPLACE(e.paterno, '�', 'Ñ') as paterno,  REPLACE(e.materno, '�', 'Ñ') as materno, 
  e.claveIssemym, e.fechaIngreso, gen.desGenero, pla.idPlaza, tp.desTipoPlaza, pl.desPuestoLaboral, 
  j.DesJuz as adscripcionActual, pe.adscripcionFisica as idAdscripcionFisica, j.cveOrganigrama as idUnidadAdmin
  FROM tblempleados e 
  left JOIN tblplazaempleados pe ON pe.idEmpleado = e.idEmpleado
  left JOIN tblgeneros gen ON gen.cveGenero = e.cvegenero
  left JOIN tblplazaslaborales pla ON pe.idPlazaLaboral = pla.idPlazaLaboral
  left JOIN tblpuestoslaborales pl ON pe.idPuestoLaboral = pl.idPuestoLaboral
  left JOIN tbltiposplaza tp ON pla.cveTipoPlaza = tp.cveTipoPlaza
  left JOIN juzgadosgestion j ON j.IdJuzgado = pe.cveAdscripcion
  left JOIN juzgadosgestion k ON k.IdJuzgado = pe.adscripcionFisica
  where e.numEmpleado =${parametro} and pe.activo='S'
  `
  // Aquí puedes hacer lo que necesites con el parámetro recibido
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error.message)
    } else {
      res.json(results)
    }
  })
})

app.get('/users/:parametro', verifyToken, (req, res) => {
  const parametro = req.params.parametro
  const query = `
  SELECT DISTINCT e.numEmpleado, e.idEmpleado, e.rfc, e.curp, e.nombre,  REPLACE(e.paterno, '�', 'Ñ') as paterno,  REPLACE(e.materno, '�', 'Ñ') as materno, 
  e.claveIssemym, e.fechaIngreso, gen.desGenero, pla.idPlaza, tp.desTipoPlaza, pl.desPuestoLaboral, 
  j.DesJuz as adscripcionActual, pe.adscripcionFisica as idAdscripcionFisica, j.cveOrganigrama as idUnidadAdmin
  FROM tblempleados e 
  left JOIN tblplazaempleados pe ON pe.idEmpleado = e.idEmpleado
  left JOIN tblgeneros gen ON gen.cveGenero = e.cvegenero
  left JOIN tblplazaslaborales pla ON pe.idPlazaLaboral = pla.idPlazaLaboral
  left JOIN tblpuestoslaborales pl ON pe.idPuestoLaboral = pl.idPuestoLaboral
  left JOIN tbltiposplaza tp ON pla.cveTipoPlaza = tp.cveTipoPlaza
  left JOIN juzgadosgestion j ON j.IdJuzgado = pe.cveAdscripcion
  left JOIN juzgadosgestion k ON k.IdJuzgado = pe.adscripcionFisica
  where e.numEmpleado =${parametro}
  `
  // Aquí puedes hacer lo que necesites con el parámetro recibido
  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error.message)
    } else {
      res.json(results)
    }
  })
})

app.get('/users/:idUser', verifyToken, (req, res) => {
  const idUser = req.params.idUser
  const query = `
  SELECT DISTINCT e.numEmpleado, e.idEmpleado, e.rfc, e.curp, e.nombre,  REPLACE(e.paterno, '�', 'Ñ') as paterno,  REPLACE(e.materno, '�', 'Ñ') as materno, 
  e.claveIssemym, e.fechaIngreso, gen.desGenero, pla.idPlaza, tp.desTipoPlaza, pl.desPuestoLaboral, 
  j.DesJuz as adscripcionActual,pe.adscripcionFisica as idAdscripcionFisica, k.DesJuz as adscripcionFisica, j.cveOrganigrama as idUnidadAdmin
  FROM tblempleados e 
  left JOIN tblplazaempleados pe ON pe.idEmpleado = e.idEmpleado
  left JOIN tblgeneros gen ON gen.cveGenero = e.cvegenero
  left JOIN tblplazaslaborales pla ON pe.idPlazaLaboral = pla.idPlazaLaboral
  left JOIN tblpuestoslaborales pl ON pe.idPuestoLaboral = pl.idPuestoLaboral
  left JOIN tbltiposplaza tp ON pla.cveTipoPlaza = tp.cveTipoPlaza
  left JOIN juzgadosgestion j ON j.IdJuzgado = pe.cveAdscripcion
  left JOIN juzgadosgestion k ON k.IdJuzgado = pe.adscripcionFisica
  where e.idEmpleado =${idUser}  AND pe.activo ='S'
  `

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).send(error.message)
    } else {
      res.json(results)
    }
  })
})

// Endpoint para obtener el Bearer Token
app.post('/login', (req, res) => {
  // Aquí iría la lógica para autenticar al usuario y generar el token
  const user = { username: 'johndoe' }
  const token = jwt.sign(user, secretKey)

  res.json({ token })
})

app.listen(3000, () => {
  console.log('API listening on port 3000')
})
