const secret = process.env.JWT_SECRET;

if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET environment variable is required');
}

module.exports = { secret };