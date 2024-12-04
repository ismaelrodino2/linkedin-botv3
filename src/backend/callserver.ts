import express from "express";
import { json } from "body-parser";
import cors from "cors";
import { PORT } from "./constants";
import { ServerContext } from "./endpoints/types";
import { handleOpen } from "./endpoints/open";
import { handleNavigate } from "./endpoints/navigate";
import { 
  handleLinkedinApply, 
  handleLinkedinPause, 
  handleLinkedinResume, 
  handleLinkedinStop 
} from "./endpoints/linkedin-controls";

export function callServer() {
  const app = express();
  
  const serverContext: ServerContext = {
    pageInstance: null,
    genAI: null,
    model: null,
    stopApplyingLinkedin: false,
    pauseApplyingLinkedin: false,
    appliedJobsLinkedin: []
  };

  app.use(cors());
  app.use(json());

  // Routes  
  // const upload = configureUpload();
  // app.post("/upload", upload.single("file"), handleUpload);
  app.post("/open", (req, res) => handleOpen(req, res, serverContext));
  app.post("/navigate", (req, res) => handleNavigate(req, res, serverContext));
  
  // LinkedIn routes
  app.post("/apply-linkedin", (req, res) => handleLinkedinApply(req, res, serverContext));
  app.post("/pause-apply-linkedin", (req, res) => handleLinkedinPause(req, res, serverContext));
  app.post("/resume-apply-linkedin", (req, res) => handleLinkedinResume(req, res, serverContext));
  app.post("/stop-apply-linkedin", (req, res) => handleLinkedinStop(req, res, serverContext));

  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
