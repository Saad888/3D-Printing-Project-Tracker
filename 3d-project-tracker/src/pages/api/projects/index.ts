// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Printer } from '@/models/printer'
import { GetProjectFromRequest } from './helper';
const { MongoClient } = require("mongodb");
const uri = process.env.CONNECTION_STRING;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new MongoClient(uri);
  const db = client.db(process.env.DATABASE)
  const projects = db.collection(process.env.PROJECTS_COLLECTION)

  if (req.method === 'GET') {
    // Get all printers
    res.status(200).send(await projects.find().toArray())

  } else {
    // Add new project
    var newProject = GetProjectFromRequest(req);
    console.log(newProject);
    if (newProject.name == null)
      res.status(401).send({ error: "No Name Provided" })
    else {
      var savedProj = await projects.insertOne(newProject)
      res.status(200).send(savedProj.insertedId)
    }
  }
  
  client.close();
}
