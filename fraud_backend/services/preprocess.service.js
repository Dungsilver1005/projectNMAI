const preprocessTransaction = (amount, timestamp, content) => {
    const date = new Date(timestamp);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

    return {
        amount,
        time: Math.floor(safeDate.getTime() / 1000),
        timestamp,
        Transaction_Content: content || ""
    };
};

module.exports = {
    preprocessTransaction
};
