const fs = require('fs/promises');
const path = require('path');

const contactsPath = path.join(__dirname, "../models/contacts.json");

const listContacts = async () => {
  const result = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(result);
}

const getContactById = async (contactId) => {
   try {
        const contacts = await listContacts();
        const contact = contacts.find((contact) => contact.id === contactId);
     return contact;
    } catch (err) {
      console.log(err);
    }
}

const saveContacts = async (contacts) => {
  try {
    const contactsJSON = JSON.stringify(contacts);
    await fs.writeFile(contactsPath, contactsJSON);
  } catch (err) {
    console.log(err);
  } 
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const removedContact = contacts.filter((contact) => contact.id !== contactId);
    await saveContacts(removedContact);
  } catch (err) {
      console.log(err);
    }
};

const addContact = async (name, email, phone) => {
  try {
    const contacts = await listContacts();
    const contact = { id: Date.now().toString(), name, email, phone };
    contacts.push(contact);
    await saveContacts(contacts);
  } catch (err) {
    console.log(err);
  }
};

const updateContact = async (contactId, body) => {
   try {
    const contacts = await listContacts();
    const updatedContactIndex = await contacts.findIndex(
      (contact) => contact.id === contactId
    );
    const updatingContact = contacts[updatedContactIndex];
    if (body.name) updatingContact.name = body.name;
    if (body.email) updatingContact.email = body.email;
    if (body.phone) updatingContact.phone = body.phone;

    await saveContacts(contacts);
    return updatingContact;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
