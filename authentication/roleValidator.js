const validateRole = (requiredRole) => (req, res, next) => {
    const { roles } = req.user || {};
    if (!roles || !roles.includes(requiredRole)) {
        return res.status(403).json({ message: 'Acceso denegado: No tienes permisos suficientes' });
    }
    next();
};

module.exports = validateRole;