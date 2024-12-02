export const handleDatabaseAction = async (action, res) => {
    try {
        return await action();
    } catch (err) {
        res.status(500).json({ error: err.message || "Database action error" });
    }
};
