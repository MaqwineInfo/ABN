const jwt = require('jsonwebtoken');
 
const authMiddleware = async (req, res, next) => { 
    const authHeader = req.headers.authorization;
    // console.log(`Authorization Header: ${authHeader ? 'Found' : 'Not Found'}`);
 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('No token provided or token is not in Bearer format.');
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided',
        });
    }
    const token = authHeader.split(' ')[1];
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables.');
        return res.status(500).json({
            success: false,
            message: 'Server misconfiguration: JWT secret is missing'
        });
    }
    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded;

        // console.log(`Authenticated User ID: ${decoded.id}`);
        next();  
    } catch (err) {
        console.error('JWT verification error:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

module.exports = authMiddleware;