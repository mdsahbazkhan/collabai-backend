const Project = require("../models/projectModel");

const permit = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id.toString();
      const projectId = req.params.projectId || req.params.id;
      
      console.log("=== PERMIT ===");
      console.log("userId:", userId);
      console.log("projectId:", projectId);

      const project = await Project.findById(projectId).select("owner members");
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const ownerId = project.owner.toString();
      const isOwner = ownerId === userId;

      const memberInMembers = project.members.find(
        (m) => m.user.toString() === userId,
      );
      const isOwnerInMembers = memberInMembers && memberInMembers.role === "owner";

      console.log("ownerId:", ownerId);
      console.log("isOwner:", isOwner);
      console.log("memberInMembers:", !!memberInMembers);
      console.log("isOwnerInMembers:", isOwnerInMembers);

      if (isOwner || isOwnerInMembers) {
        console.log("PASS - calling next()");
        req.memberRole = "owner";
        req.project = project;
        return next();
      }

      console.log("FAIL - checking member role");
      if (!memberInMembers) {
        return res
          .status(403)
          .json({ message: "Access denied: Not a member of this project" });
      }
      if (!allowedRoles.includes(memberInMembers.role)) {
        return res
          .status(403)
          .json({ message: "Access denied: Insufficient permissions" });
      }
      req.memberRole = memberInMembers.role;
      req.project = project;
      console.log("PASS - member role OK, calling next()");
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
};
module.exports = { permit };
