const preprocessTransaction = ({ amount, timestamp, content, merchant = "", channel = "", location = "" }) => {
    const date = new Date(timestamp);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    const textParts = [content, merchant, channel, location].filter(Boolean);

    return {
        amount,
        time: Math.floor(safeDate.getTime() / 1000),
        timestamp,
        Transaction_Content: textParts.join(' ')
    };
};

module.exports = {
    preprocessTransaction
};
