// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Printer } from '@/models/printer'
import { ObjectId } from 'mongodb';
const { MongoClient } = require("mongodb");
const uri = process.env.CONNECTION_STRING;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const id = req.query.id?.toString()
    const o_id = new ObjectId(id);

    const client = new MongoClient(uri);
    const db = client.db(process.env.DATABASE)
    const printers = db.collection(process.env.PRINTER_COLLECTION)

    if (req.method === 'POST') {
        var printer = await printers.findOne({ "_id": o_id })
        if (printer == null)
            res.status(404).send({ error: "Printer does not exist" })
        else if (req.body.name == null)
            res.status(401).send({ error: "No Name Provided" })
        else if ((await printers.find({ "name": req.body.name }).toArray()).some((p: Printer) => p._id != id))
            res.status(401).send({ error: "Name Exists" })
        else {
            var newPrinter: Printer = {
                name: req.body.name,
                link: req.body.link
            }
            // Add new printer
            await printers.updateOne({ "_id": o_id }, { $set: newPrinter })
            res.status(200).send(await printers.find().toArray())
        }
    }

    if (req.method === "DELETE") {
        var printer = await printers.findOne({ "_id": o_id })
        if (printer == null)
            res.status(404).send({ error: "Printer does not exist" })
        else {
            await printers.deleteOne({ "_id": o_id })
            res.status(200).send(await printers.find().toArray())
        }
    }

    client.close();
}
