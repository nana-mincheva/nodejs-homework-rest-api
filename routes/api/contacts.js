const express = require('express')
const router = express.Router()
const Joi = require('joi');

const { listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact, } = require("../../models/contacts")

const schemaCreateContacts = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

const schemaUpdateContacts = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
})
  .or("name", "email", "phone");

router.get('/', async (req, res, next) => {
  const contactList = await listContacts();
  res.json({
    status: 'success',
    code: 200,
    data: {
      contactList
    },
  })
});

router.get('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) {
    return res.status(404).json({
      status: 'error',
      code: 404,
      message: "Not Found!"
    });
  } else {
    res.json({
      status: 'success',
      code: 200,
      data: {
        contact
      },
    })
  }
});

router.post('/', async (req, res, next) => {
  const { name, email, phone } = req.body;
  const { error, value } = schemaCreateContacts.validate({ name, phone, email })
  if (error) {
    return res.status(400).json({ message: "missing required name field" });
  }

  const newContact = await addContact(value);

  res.json({
    status: 'success',
    code: 201,
    data: {
      newContact
    },
  })
});

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params
    const contactToRemove = await removeContact(contactId)
    if (!contactToRemove) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Contact deleted" })
  } catch (error) {
    next(error)
  }
});


router.put('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  const { name, phone, email } = req.body;
  const { error, value } = schemaUpdateContacts.validate({ name, phone, email })

  if (error) {
    return res.status(400).json({ message: "missing fields" });
  }

  const updContact = await updateContact(contactId, value)

  if (updContact === null) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json({
    status: 'success',
    code: 200,
    data: {
      updContact
    },
  });

});


module.exports = router
