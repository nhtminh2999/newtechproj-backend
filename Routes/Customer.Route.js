const { json } = require('express');
const express = require('express');
const auth = require('../Middleware/auth');

let Customer = require('../Models/Customer.Model');
const router = express.Router();

router.post('/search', async (req, res) => {
    const searchModel = req.body;

    let query = {};
    if (!!searchModel.Customer_Code) {
        query.Customer_Code = { $regex: searchModel.Customer_Code, $options: 'i' };
    }
    if (!!searchModel.Customer_Type) {
        query.Customer_Type = searchModel.Customer_Type;
    }
    if (!!searchModel.Customer_Birthday && searchModel.Customer_Birthday.length > 0) {
        if (searchModel.Customer_Birthday[0] !== '' && searchModel.Customer_Birthday[1] !== '') {
            const startDate = new Date(`${searchModel.Customer_Birthday[0]} 0:0:0 `);
            const endDate = new Date(`${searchModel.Customer_Birthday[1]} 23:59:59 `);
            query.Customer_Birthday = { $gte: startDate, $lte: endDate }
        }
    }
    if (!!searchModel.Customer_Fullname) {
        query.Customer_Fullname = { $regex: searchModel.Customer_Fullname, $options: 'i' };
    }
    if (!!searchModel.Customer_Phonenumber) {
        query.Customer_Phonenumber = { $regex: searchModel.Customer_Phonenumber, $options: 'i' };
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
            { path: 'UpdatedByObject' }
        ],
        sort: { 'Customer_Code': 1 },
    }

    Customer.find({ $and: [query] }, null, options, function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    });
});

router.post('/getDataFilter', async (req, res) => {
    const searchModel = req.body;
    let query1 = {};
    let query2 = {};
    let queryStatus = {};
    if (!!searchModel.Status) {
        queryStatus.Status = searchModel.Status;
    }
    if (!!searchModel.Value) {
        query1.Customer_Fullname = { $regex: searchModel.Value, $options: 'i' };
        query2.Customer_Code = { $regex: searchModel.Value, $options: 'i' };
    }
    const options = {
        select: 'id Customer_Code Customer_Fullname',
        sort: '1',
        limit: 10,
    }
    Customer.find({ $and: [queryStatus, { $or: [query1, query2] }] }, null, options, function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    });
});

async function autoGenateCode() {
    const customer = await Customer.find({});
    const date = new Date();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().substr(-2);
    if (!!customer) {
        if (customer.length > 0) {
            const nextNumber = (parseInt((customer[customer.length - 1].Customer_Code).substr(-4), 10) + 1).toString();
            const suffix = nextNumber.padStart(4, '0');
            return 'KH' + year + month + suffix;
        }
        else {
            const nextNumber = '1';
            const suffix = nextNumber.padStart(4, '0');
            return 'KH' + year + month + suffix;
        }
    }
}

router.post('/create', async (req, res) => {
    let model = req.body;
    model.Customer_Code = await autoGenateCode();
    const customer = new Customer(model);

    const isExistedEmail = await Customer.find({ Customer_Email: model.Customer_Email });
    if (!!isExistedEmail && isExistedEmail.length > 0) {
        return res.json({ message: 'Email existed' })
    }

    const isExistedPhone = await Customer.find({ Customer_Phonenumber: model.Customer_Phonenumber });
    if (!!isExistedPhone && isExistedPhone.length > 0) {
        return res.json({ message: 'Phone existed' })
    }

    customer.save(function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    });
});

router.post('/update', async (req, res) => {
    let model = req.body;
    const isExistedEmail = await Customer.find({ Customer_Email: model.Customer_Email, Customer_Code: { $ne: model.Customer_Code } });
    if (!!isExistedEmail && isExistedEmail.length > 0) {
        return res.json({ message: 'Email existed' })
    }
    const isExistedPhone = await Customer.find({ Customer_Phonenumber: model.Customer_Phonenumber, Customer_Code: { $ne: model.Customer_Code } });
    if (!!isExistedPhone && isExistedPhone.length > 0) {
        return res.json({ message: 'Phone existed' })
    }
    let queryUpdate = {};
    queryUpdate.Customer_Code = model.Customer_Code;
    const modelForUpdate = {
        Customer_Code: model.Customer_Code,
        Customer_Type: model.Customer_Type,
        Customer_Fullname: model.Customer_Fullname,
        Customer_Phonenumber: model.Customer_Phonenumber,
        Customer_Birthday: model.Customer_Birthday,
        Customer_Email: model.Customer_Email,
        Customer_Address: model.Customer_Address,
        Status: model.Status,
        UpdatedBy: model.UpdatedBy,
        UpdatedDate: Date.now(),
    }

    const newValue = { $set: modelForUpdate };
    Customer.findOneAndUpdate(queryUpdate, newValue, async function (err, result) {
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
    query.Customer_Code = { $in: listDelete };
    Customer.deleteMany(query, function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    })
})

module.exports = router;


