const router = require("express").Router();
const ctrl = require("../../controllers/contacts");
const { validation, auth } = require("../../middlewares");
const { schemas } = require("../../models/contacts");

router.get("/", auth, ctrl.getAll);
router.post("/", auth, validation(schemas.addSchema), ctrl.addContact);
router.get("/:contactId", auth, ctrl.getContactById);
router.delete("/:contactId", auth, ctrl.removeContact);
router.put(
  "/:contactId",
  auth,
  validation(schemas.addSchema),
  ctrl.updateContact
);
router.patch(
  "/:id/favorite",
  auth,
  validation(schemas.addSchema),
  ctrl.updateStatusContact
);

module.exports = router;