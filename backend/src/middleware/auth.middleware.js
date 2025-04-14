const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization']

  if (!token) {
    return res.status(403).json({ message: 'Se requiere un token para la autenticación' })
  }

  try {
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = {
  verifyToken
} 