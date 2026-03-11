// How many days out we consider "expiring soon" — change this if 3 days feels too tight
const EXPIRING_SOON_DAYS = 3;

// returns "expired", "expiring-soon", or "fresh"
function getExpirationStatus(expirationDate, now = new Date()) {
    const expiration = new Date(expirationDate);
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + EXPIRING_SOON_DAYS);

    if (expiration < now) return "expired";
    if (expiration <= threshold) return "expiring-soon";
    return "fresh";
}

// Takes a pantry item and tacks on an expirationStatus field
// saves frontend from doing date math
function withExpirationStatus(item, now = new Date()) {
    const obj = typeof item.toObject === "function" ? item.toObject() : item;
    return {
        ...obj,
        expirationStatus: getExpirationStatus(obj.expirationDate, now),
    };
}

module.exports = {
    EXPIRING_SOON_DAYS,
    getExpirationStatus,
    withExpirationStatus,
};
