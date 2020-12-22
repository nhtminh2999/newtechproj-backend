const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contactHistorySchema = new Schema({
    Contact_History_Code: {
        type: String,
        trim: true,
    },
    Contact_History_Customer: {
        type: String,
        required: true
    },
    Contact_History_MettingDate: {
        type: Date,
        default: Date.now(),
    },
    Contact_History_Content: {
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

contactHistorySchema.virtual('CustomerObject', {
    ref: 'User',
    localField: 'CreatedBy',
    foreignField: 'User_Name',
    justOne: true
});

contactHistorySchema.virtual('CreatedByObject', {
    ref: 'User',
    localField: 'CreatedBy',
    foreignField: 'User_Name',
    justOne: true
});

contactHistorySchema.virtual('UpdatedByObject', {
    ref: 'User',
    localField: 'UpdatedBy',
    foreignField: 'User_Name',
    justOne: true
});

contactHistorySchema.set('toJSON', { virtuals: true });
const Contact_History = mongoose.model('Contact_History', contactHistorySchema, 'Contact_History');

module.exports = Contact_History;