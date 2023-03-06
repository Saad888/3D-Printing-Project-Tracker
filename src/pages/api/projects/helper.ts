import { NextApiRequest } from "next";

export function GetProjectFromRequest(req: NextApiRequest){
    console.log(req.body);
    var body = req.body;
    return {
        name: body.name,
        notes: body.notes,
        parts: body.parts,
        completed: body.completed
    }
}