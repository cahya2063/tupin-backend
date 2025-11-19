import { Snap } from 'midtrans-client';

// Create Snap API instance
let snap = new Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
})

const createTransactionGateway = async(req, res)=>{
    try {
        const request = {
            transaction_details: {
                order_id: `GATEWAY ${Math.floor(Math.random()*1000000)}`,
                gross_amount: req.body.amount
            },
            customer_details: {
                first_name: req.body.name,
                email: req.body.email
            }
        }
    } catch (error) {
        
    }
}

const createTransactionCash = async(req, res)=>{
    try {
        
    } catch (error) {
        
    }
}