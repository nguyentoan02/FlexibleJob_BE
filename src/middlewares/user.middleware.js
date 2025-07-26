export const checkUserId = () => {
    return (req, res, next) => {
        const userId1 = req.user.id;
        const { userId } = req.params;
        if (userId === userId1) {
            next();
        }
        return res.status(403).json({ message: "Access denied" });
    };
};
