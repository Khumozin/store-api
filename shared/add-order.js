const { toJSON } = require('../helpers/functions');
const moment = require('moment');
const OrderDetails = require('../models/OrderDetails');

const addOrderDetails = async (data) => {
    if (!data)
        return undefined;

    // Modify
    data.IsDelivered = false;
    data.DateCreated = moment().format();
    data.DateUpdated = moment().format();
    data.amount = data.amount_gross;
    const deliveryInfo = toJSON(data.custom_str3);
    data.email_address = `${deliveryInfo['EmailAddress']}`.toLowerCase();

    // save
    const orderDetails = new OrderDetails({ ...data });
    const results = await orderDetails.save();

    if (!results)
        return undefined;

    // transform
    delete results._doc.__v;
    let savedOrderDetails = { ID: results._id, ...results._doc };
    delete savedOrderDetails['_id'];

    return savedOrderDetails;
}

module.exports.addOrderDetails = addOrderDetails;
