const axios = require("axios");
const crypto = require("crypto");
const dns = require('dns');
const moment = require('moment');
const OrderDetails = require('../models/OrderDetails');


const toJSON = text => {
    let array = [];
    let stringifiedObject = '';

    if (text.endsWith('%')) {
        text = text.substring(0, text.length - 1);
    }

    text = text.replace(/=/g, ':');
    array = text.replace(/%/g, ';').split(';');

    array.forEach((ii) => {
        const items = ii.split(':');
        stringifiedObject += `"${items[0]}": "${items[1]}",`;
    });

    const parsedObject = `{${stringifiedObject.substring(0, stringifiedObject.length - 1)}}`;

    return JSON.parse(parsedObject);
};

const toHexString = byteArray => {
    let s = '';
    byteArray.forEach((byte) => {
        s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
    });
    return s;
}

const generateSignature = (data, passPhrase = null) => {
    let pfOutput = "";

    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== "") {
                // #region custom code for removing leading and trailing spaces
                let value = '';
                if (typeof data[key] === 'string') {
                    value = data[key].trim();
                } else {
                    value = data[key];
                }
                // #endregion
                // pfOutput += `${key}=${encodeURIComponent(data[key] + ''.trim()).replace(/%20/g, " + ")}&`
                pfOutput += `${key}=${encodeURIComponent(value).replace(/%20/g, " + ")}&`
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
}

const paymentNotification = async req => {
    if (!req)
        return undefined;

    let response = {};
    const pfHost = process.env.TESTING_MODE ? "sandbox.payfast.co.za" : "www.payfast.co.za";

    // Conduct security checks
    const pfData = JSON.parse(JSON.stringify(req.body));

    let pfParamString = "";
    for (let key in pfData) {
        if (pfData.hasOwnProperty(key) && key !== "signature") {
            pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
        }
    }

    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);

    // Verify the signature
    const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
        // Calculate security signature
        let tempParamString = '';
        if (pfPassphrase !== null) {
            pfParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
        }

        const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
        return pfData['signature'] === signature;
    };

    // Check valid PayFast domain
    const pfValidIP = async (req) => {
        const validHosts = [
            'www.payfast.co.za',
            'sandbox.payfast.co.za',
            'w1w.payfast.co.za',
            'w2w.payfast.co.za'
        ];

        let validIps = [];
        const pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        try {
            for (let key in validHosts) {
                const ips = await ipLookup(validHosts[key]);
                validIps = [...validIps, ...ips];
            }
        } catch (err) {
            console.error(err);
        }

        const uniqueIps = [...new Set(validIps)];

        if (uniqueIps.includes(pfIp)) {
            return true;
        }
        return false;
    };

    // Compare payment data
    const pfValidPaymentData = (cartTotal, pfData) => {
        return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
    };

    // Perform a server request to confirm the details
    const pfValidServerConfirmation = async (pfHost, pfParamString) => {
        const result = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString)
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                console.error(error)
            });
        return result === 'VALID';
    };

    // Bringing the checks together
    const check1 = pfValidSignature(pfData, pfParamString, null);
    const check2 = await pfValidIP(req);
    const check3 = pfValidPaymentData(pfData['amount_gross'], pfData);
    const check4 = await pfValidServerConfirmation(pfHost, pfParamString);

    // Update Order in DB
    // let reqObj = {
    //     OrderNo: pfData.item_name,
    //     Email: pfData.email_address,
    //     Name: pfData.name_first
    // };

    // let order = await getOrderDetailsByObj(reqObj);

    // Create order in DB
    pfData.IsDelivered = false;
    pfData.DateCreated = moment().format();
    pfData.DateUpdated = moment().format();
    pfData.amount = pfData.amount_gross;
    const deliveryInfo = toJSON(pfData.custom_str3);
    pfData.email_address = `${deliveryInfo['EmailAddress']}`.toLowerCase();

    // save
    const orderDetails = new OrderDetails({ ...pfData });
    const results = await orderDetails.save();

    if (!results)
        return undefined;

    // transform
    delete results._doc.__v;
    let savedOrderDetails = { ID: results._id, ...results._doc };
    delete savedOrderDetails['_id'];

    if (check1 && check2 && check3 && check4) {

        // All checks have passed, the payment is successful
        response = {
            Message: 'All checks have passed, the payment is successful',
            IsValidSignature: check1,
            IsValidIP: check2,
            IsValidPaymentData: check3,
            IsValidServerConfirmation: check4,
            IsOrderCreated: !!savedOrderDetails
        };

    } else {
        // Some checks have failed, check payment manually and log for investigation
        response = {
            Message: 'Some checks have failed, check payment manually and log for investigation',
            IsValidSignature: check1,
            IsValidIP: check2,
            IsValidPaymentData: check3,
            IsValidServerConfirmation: check4,
            IsOrderCreated: !!savedOrderDetails
        };
    }

    return response;
};

async function ipLookup(domain) {
    return new Promise((resolve, reject) => {
        dns.lookup(domain, { all: true }, (err, address, family) => {
            if (err) {
                reject(err)
            } else {
                const addressIps = address.map(function (item) {
                    return item.address;
                });
                resolve(addressIps);
            }
        });
    });
}

module.exports.toJSON = toJSON;
module.exports.toHexString = toHexString;
module.exports.generateSignature = generateSignature;
module.exports.paymentNotification = paymentNotification;