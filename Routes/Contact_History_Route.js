const express = require('express');
const auth = require('../Middleware/auth');

let Contact_History = require('../Models/Contact_History.Model');
const router = express.Router();

router.post('/search', async (req, res) => {
    const searchModel = req.body;

    let query = {};
    if (!!searchModel.Contact_History_Code) {
        query.Contact_History_Code = searchModel.Contact_History_Code;
    }
    if (!!searchModel.Contact_History_MettingDate && searchModel.Contact_History_MettingDate.length > 0) {
        if (searchModel.Contact_History_MettingDate[0] !== '' && searchModel.Contact_History_MettingDate[1] !== '') {
            const startDate = new Date(`${searchModel.Contact_History_MettingDate[0]} 0:0:0 `);
            const endDate = new Date(`${searchModel.Contact_History_MettingDate[1]} 23:59:59 `);
            query.Contact_History_MettingDate = { $gte: startDate, $lte: endDate }
        }
    }
    if (!!searchModel.Contact_History_Customer) {
        query.Status = searchModel.Contact_History_Customer;
    }
    if (!!searchModel.Status) {
        query.Status = searchModel.Status;
    }
    if (!!searchModel.CreatedBy) {
        query.CreatedBy = searchModel.CreatedBy;
    }
    if (!!searchModel.CreatedDate && searchModel.CreatedDate.length > 0) {
        if (searchModel.CreatedDate[0] !== '' && searchModel.CreatedDate[1] !== '') {
            const startDate = new Date(`${searchModel.CreatedDate[0]} 0:0:0 `);
            const endDate = new Date(`${searchModel.CreatedDate[1]} 23:59:59 `);
            query.CreatedDate = { $gte: startDate, $lte: endDate }
        }
    }
    if (!!searchModel.UpdatedBy) {
        query.UpdatedBy = searchModel.UpdatedBy;
    }
    if (!!searchModel.UpdatedDate && searchModel.UpdatedDate.length > 0) {
        if (searchModel.UpdatedDate[0] !== '' && searchModel.UpdatedDate[1] !== '') {
            const startDate = new Date(`${searchModel.UpdatedDate[0]} 0:0:0 `);
            const endDate = new Date(`${searchModel.UpdatedDate[1]} 23:59:59 `);
            query.UpdatedDate = { $gte: startDate, $lte: endDate }
        }
    }

    const options = {
        populate: [
            { path: 'CreatedByObject' },
            { path: 'UpdatedByObject' },
            { path: 'CustomerObject' }
        ],
        sort: { 'Contact_History_Code': 1 },
    }

    Contact_History.find({ $and: [query] }, null, options, function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    });
});

router.post('/getDataFilter', async (req, res) => {
    const searchModel = req.body;
    let query = {};
    let queryStatus = {};
    if (!!searchModel.Status) {
        queryStatus.Status = searchModel.Status;
    }
    if (!!searchModel.Value) {
        query.Contact_History_Code = { $regex: searchModel.Value, $options: 'i' };
    }
    const options = {
        select: 'id Contact_History_Code',
        sort: '1',
        limit: 10,
    }
    Contact_History.find({ $and: [queryStatus, { $or: [query] }] }, null, options, function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    });
});

async function autoGenateCode() {
    const contactHistory = await Contact_History.find({});
    const date = new Date();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().substr(-2);
    if (!!contactHistory) {
        if (contactHistory.length > 0) {
            const nextNumber = (parseInt((contactHistory[contactHistory.length - 1].Contact_History_Code).substr(-4), 10) + 1).toString();
            const suffix = nextNumber.padStart(4, '0');
            return 'LH' + year + month + suffix;
        }
        else {
            const nextNumber = '1';
            const suffix = nextNumber.padStart(4, '0');
            return 'LH' + year + month + suffix;
        }
    }
}

router.post('/create', async (req, res) => {
    let model = req.body;
    model.Contact_History_Code = await autoGenateCode();
    const contactHistory = new Contact_History(model);

    contactHistory.save(function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    });
});

router.post('/update', async (req, res) => {
    let model = req.body;
    let queryUpdate = {};
    queryUpdate.Contact_History_Code = model.Contact_History_Code;
    const modelForUpdate = {
        Contact_History_Code: model.Contact_History_Code,
        Contact_History_Customer: model.Contact_History_Customer,
        Contact_History_MettingDate: model.Contact_History_MettingDate,
        Contact_History_Content: model.Contact_History_Content,
        Status: model.Status,
        UpdatedBy: model.UpdatedBy,
        UpdatedDate: Date.now(),
    }

    const newValue = { $set: modelForUpdate };
    Contact_History.findOneAndUpdate(queryUpdate, newValue, async function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    })
});

router.post('/deleteModels', (req, res) => {
    let listDelete = req.body;
    let query = {};
    query.Contact_History_Code = { $in: listDelete };
    Contact_History.deleteMany(query, function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    })
})

module.exports = router;