"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const sessionStore_1 = require("./utilities/sessionStore");
const passport_1 = __importDefault(require("passport"));
const userRoutes_1 = require("./routes/userRoutes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./swagger"));
const adminRoutes_1 = require("./routes/adminRoutes");
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const skillRoutes_1 = __importDefault(require("./routes/skillRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const vulnerabilityRoutes_1 = __importDefault(require("./routes/vulnerabilityRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const matchingRoutes_1 = __importDefault(require("./routes/matchingRoutes"));
const minio_1 = require("./utilities/minio");
const port = process.env.BACKEND_PORT; //6977
const cookieExpireTime = { real: 1000 * 60 * 60 * 4, dev: 1000 * 60 * 5 };
const app = (0, express_1.default)();
// Test MinIO connection on startup
(0, minio_1.testMinioConnection)()
    .then((success) => {
    if (!success) {
        console.error('Failed to connect to MinIO. Check your configuration.');
        process.exit(1);
    }
})
    .catch((error) => {
    console.error('Error testing MinIO connection:', error);
    process.exit(1);
});
app.use(express_1.default.json());
app.use([
    (0, cors_1.default)({
        origin: [
            `http://localhost:${process.env.FRONTEND_PORT}`, // Frontend dev server
            'http://localhost', // Nginx proxy
            'http://localhost:80', // Explicit Nginx port
            'http://localhost:1982' // MinIO compatibility port
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }),
    (0, helmet_1.default)(),
    (0, express_session_1.default)({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        store: sessionStore_1.sessionStore,
        cookie: { maxAge: cookieExpireTime.dev, httpOnly: true },
    }),
    passport_1.default.initialize(),
    passport_1.default.session(),
    express_1.default.json(),
]);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.get("/", async (req, res) => {
    res.json({ success: true, msg: "hello world" });
});
// Test MinIO connection endpoint
app.get("/test-minio", async (req, res) => {
    try {
        const success = await (0, minio_1.testMinioConnection)();
        if (success) {
            res.json({ success: true, msg: "MinIO connection successful" });
        }
        else {
            res.status(500).json({ success: false, msg: "MinIO connection failed" });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, msg: "Error testing MinIO connection", error });
    }
});
// Routes
app.use("/api/user", userRoutes_1.userRouter);
app.use("/api/admin", adminRoutes_1.adminRouter);
app.use("/api/post", postRoutes_1.default);
app.use("/api/skill", skillRoutes_1.default);
app.use("/api/category", categoryRoutes_1.default);
app.use("/api/vulnerability", vulnerabilityRoutes_1.default);
app.use("/api/notification", notificationRoutes_1.default);
app.use("/api/matching", matchingRoutes_1.default);
// HTTP Server setup
app.listen(port, () => {
    console.log(`listening on port ${port}...`);
});
