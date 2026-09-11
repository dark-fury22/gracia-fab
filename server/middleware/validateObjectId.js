import mongoose from "mongoose";

// A malformed id (route param) reaching Mongoose's findById/findOne throws a
// CastError, which every controller's generic catch block turns into a 500 —
// this returns a proper 400 before it gets that far.
const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ message: `Invalid ${paramName}` });
  }
  next();
};

export default validateObjectId;
