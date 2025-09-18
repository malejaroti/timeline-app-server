// ℹ️ Middleware to handle 404 and generic errors in the application

import { Request, Response, NextFunction, Application } from 'express';

export default function handleErrors(app : Application) {
  
  // ℹ️ Handles requests to undefined routes (404 Not Found)
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: "This route does not exist" });
  });

  // ℹ️ Centralized generic error handling middleware. whenever you call next(error), this middleware will handle the error
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {

    // always logs the error
    console.error("ERROR", req.method, req.path, "\nFULL ERROR:\n", err);
    // console.error("ERROR", req.method, req.path, "\nERR MSG:", err.errorResponse?.errmsg, "\n\nFULL ERROR:\n", err);

    // Sends a generic server error response if headers haven't been sent
    if (!res.headersSent) {
      res
        .status(500)
        .json({
          message: "Internal server error. Check the server console for details",
        });
    }
  });
};

// module.exports = handleErrors