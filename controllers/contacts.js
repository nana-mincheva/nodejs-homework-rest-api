const Contact = require('../models/contacts');
const { ctrlWrapper } = require("../helpers");
const { schemaCreateContact, schemaUpdateContact, schemaUpdateStatusContact } = require("../schema/schemaValidate");

const getAll = async (req, res) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10, favorite } = req.query;
    const skip = (page - 1) * limit;

    let contactList = [];

    if (favorite) {
        contactList = await Contact.find({ owner }, "-createdAt -updatedAt",
            { skip, limit, }
        ).where('favorite').equals(favorite).populate("owner", "email")

    }
    else {
        contactList = await Contact.find({ owner }, "-createdAt -updatedAt",
            { skip, limit, }
        ).populate("owner", "email")
    }
    res.json(contactList)
};

const getContactById = async (req, res, next) => {
    const { contactId } = req.params
    const contact = await Contact.findById(contactId)
    if (!contact) {
        res.status(404).json({
            status: 'error',
            code: 404,
            message: `Contact with id ${contactId} not found`
        })
        return
    }
    res.json(
        {
            status: 'success',
            code: 200,
            contact
        })
};

const removeContact = async (req, res, next) => {
    const { contactId } = req.params;

    try {
        const result = await Contact.findByIdAndRemove({ _id: contactId })
        if (result) {
            res.json(result)
        }
        else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${contactId}`,
                data: 'Not Found',
            })
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const addContact = async (req, res) => {
    const { _id: owner } = req.user;
    const { name, email, phone } = req.body;
    const { error, value } = schemaCreateContact.validate({ name, phone, email })

    if (error) {
        return res.status(400).json({ message: "missing required name field" });
    }

    const newContact = await Contact.create({ ...value, owner })
    res.status(201).json(newContact);
};

const updateContact = async (req, res, next) => {
    const { contactId } = req.params;
    const { name, email, phone } = req.body;
    const { error, value } = schemaUpdateContact.validate({ name, phone, email })

    if (error) {
        return res.status(400).json({ message: "missing required name field" });
    }

    try {
        const result = await Contact.findOneAndUpdate({ _id: contactId }, value, { returnOriginal: false });
        if (result) {
            res.json(result)
        }
        else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${contactId}`,
                data: 'Not Found',
            })
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updateStatusContact = async (req, res, next) => {
    const { contactId } = req.params;
    const { favorite = false } = req.body;

    if (!favorite) {
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'missing field favorite',
        })
    }

    const { error, value } = schemaUpdateStatusContact.validate({ favorite });

    if (error) {
        return res.status(400).json({ message: "missing required name field" });
    }

    try {
        const result = await Contact.findByIdAndUpdate({ _id: contactId }, value, { returnOriginal: false })
        if (result) {
            res.json(result)
        }
        else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${contactId}`,
                data: 'Not Found',
            })
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

module.exports = {
    getAll: ctrlWrapper(getAll),
    getContactById: ctrlWrapper(getContactById),
    addContact: ctrlWrapper(addContact),
    removeContact: ctrlWrapper(removeContact),
    updateContact: ctrlWrapper(updateContact),
    updateStatusContact: ctrlWrapper(updateStatusContact)
};