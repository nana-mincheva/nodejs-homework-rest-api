const Contact = require('../models/contacts');
const { ctrlWrapper } = require("../helpers");
const { schemaCreateContact, schemaUpdateContact, schemaUpdateStatusContact } = require("../schema/schemaValidate");

const getAll = async (req, res) => {
    const _id = req.user._id;
    const { page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
    const contactList = await Contact.find({ owner: _id }, "", { skip, limit: Number(limit) })
        .populate("owner", "_id name email");
     res.json({
            status: "success",
            code: 200,
            data: {
            result: contactList,
            },
        });
};

const getContactById = async (req, res, next) => {
    const { contactId } = req.params;
    const { _id } = req.user;
    const contact = await Contact.findOne({ _id: contactId, owner: _id });
    if (!contact) {
        res.status(404).json({
            status: 'error',
            code: 404,
            message: `Contact with id ${contactId} not found`,
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
    const { _id } = req.user;
    const result = await Contact.findByIdAndRemove({ contactId, owner: _id });
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
};

const addContact = async (req, res) => {
    const _id = req.user._id;
    const { name, email, phone } = req.body;
    const { error, value } = schemaCreateContact.validate({ name, phone, email })

    if (error) {
        return res.status(400).json({ message: "missing required name field" });
    }
    const newContact = await Contact.create({ ...value, owner: _id })
    res.status(201).json(newContact);
};

const updateContact = async (req, res, next) => {
    const { contactId } = req.params;
    const { _id } = req.user;
    const { name, email, phone } = req.body;
    const { error, value } = schemaUpdateContact.validate({ name, phone, email })

    if (error) {
        return res.status(400).json({ message: "missing required name field" });
    }
    try {
        const result = await Contact.findOneAndUpdate({ _id: contactId, owner: _id }, value, { new: true });
        if (result) {
            res.json(result)
        }
        else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${contactId}`,
            })
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updateStatusContact = async (req, res, next) => {
    const { contactId } = req.params;
    const { favorite } = req.body;
    const { _id } = req.user;

    if (!favorite) {
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'missing field favorite',
        });
    }
    const { error, value: validatedData } = schemaUpdateStatusContact.validate({ favorite });

    if (error) {
        return res.status(400).json({ message: `missing required name field` });
    }
    try {
        const result = await Contact.findOneAndUpdate({ _id: contactId, owner: _id }, validatedData, { new: true });

        if (!result) {
            return res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${contactId}`,
                data: 'Not Found',
            });
        }
        res.json(result);
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