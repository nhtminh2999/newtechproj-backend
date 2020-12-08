const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    Customer_Code: {
        type: String,
        trim: true,
    },
    Customer_Type: {
        type: String,
    },
    Customer_Fullname: {
        type: String,
        required: true
    },
    Customer_Phonenumber: {
        type: String,
        trim: true,
    },
    Customer_Birthday: {
        type: Date,
        default: Date.now(),
    },
    Customer_Email: {
        type: String,
        trim: true
    },
    Customer_Address: {
        type: String,
    },
    Status: {
        type: String,
    },
    CreatedBy: {
        type: String,
    },
    CreatedDate: {
        type: Date,
        default: Date.now(),
    },
    UpdatedBy: {
        type: String,
    },
    UpdatedDate: {
        type: Date,
        default: Date.now(),
    }
});

customerSchema.virtual('CreatedByObject', {
    ref: 'User',
    localField: 'CreatedBy',
    foreignField: 'User_Name',
    justOne: true
});

customerSchema.virtual('UpdatedByObject', {
    ref: 'User',
    localField: 'UpdatedBy',
    foreignField: 'User_Name',
    justOne: true
});

customerSchema.set('toJSON', { virtuals: true });
const Customer = mongoose.model('Customer', customerSchema, 'Customer');

module.exports = Customer;