// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb';
import { GetProjectFromRequest } from './helper';
const { MongoClient } = require("mongodb");
const uri = process.env.CONNECTION_STRING;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const id = req.query.id?.toString()
    console.log(id)
    if (id === null) {
        res.status(404)
        return
    }
    const o_id = new ObjectId(id);
    const client = new MongoClient(uri);
    const db = client.db(process.env.DATABASE)
    const projects = db.collection(process.env.PROJECTS_COLLECTION)
    if (req.method === 'GET') {
        // Get all printers
        res.status(200).send(await projects.findOne({ _id: o_id }));
    }

    if (req.method === 'POST') {
        var project = await projects.findOne({ "_id": o_id })
        if (project == null)
            res.status(404).send({ error: "Project does not exist" })

        var newProject = GetProjectFromRequest(req);
        if (newProject.name === null)
            res.status(401).send({ error: "Provide Name" })
        else {
            console.log(newProject)
            await projects.updateOne({ "_id": o_id }, { $set: newProject })
            res.status(200).send(await projects.findOne({ _id: o_id }));
        }
    }

    if (req.method === "DELETE") {
        var project = await projects.findOne({ "_id": o_id })
        if (project == null)
            res.status(404).send({ error: "Project does not exist" })
        else {
            await projects.deleteOne({ "_id": o_id })
            res.status(200).send(await projects.find().toArray())
        }
    }
    client.close();
}




