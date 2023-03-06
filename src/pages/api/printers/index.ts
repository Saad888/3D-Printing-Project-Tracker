// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Printer } from '@/models/printer'
const { MongoClient } = require("mongodb");
const uri = process.env.CONNECTION_STRING;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new MongoClient(uri);
  const db = client.db(process.env.DATABASE)
  const printers = db.collection(process.env.PRINTER_COLLECTION)

  if (req.method === 'GET') {
    // Get all printers
    res.status(200).send(await printers.find().toArray())
  } else {
    // Add new printer
    if (req.body.name == null)
      res.status(401).send({ error: "No Name Provided" })
    else if (await printers.findOne({"name": req.body.name}) != null)
      res.status(401).send({ error: "Name Exists" })
    else {
      var newPrinter: Printer = {
        name: req.body.name,
        link: req.body.link
      }
      await printers.insertOne(newPrinter)
      res.status(200).send(await printers.find().toArray())
    }
  }
  
  client.close();
}
