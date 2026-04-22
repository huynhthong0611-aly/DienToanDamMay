module.exports = function (app) {

    // 404 NOT FOUND
    app.use((req, res, next) => {
        res.status(404).json({
            success: false,
            message: `Không tìm thấy router: ${req.originalUrl}`
        });
    });

    // GLOBAL ERROR HANDLER
    app.use((err, req, res, next) => {
        console.error('🔥 ERROR FULL DETAIL:');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);

        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Lỗi server',
            stack: err.stack 
        });
    });

};