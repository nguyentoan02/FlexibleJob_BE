import express from "express";
import {
    getAllAcceptedApplication,
    getAllApplication,
    getAllAppliedApplication,
    getAllRejectedApplication,
} from "../controllers/companyApplication.controller.js";
import auth from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.get("/", auth, getAllApplication);
Router.get("/hired", auth, getAllAcceptedApplication);
Router.get("/rejected", auth, getAllRejectedApplication);
Router.get("/applied", auth, getAllAppliedApplication);

export default Router;
