import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { StylesProps } from '../../types';
import clientPromise from '../../lib/mongodb';

export interface TemplateDocument {
  _id: string;
  userID: string;
  date: Date;
  name: string;
  styles: StylesProps;
  trashed?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('templates');

  if (req.method === 'POST') {
    const { body } = req;

    if (!body) {
      throw new Error('No data posted');
    }

    if (!body.userID) {
      throw new Error('No user ID provided');
    }

    try {
      const result = await collection.insertOne({
        ...body,
        date: new Date(),
      });
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  if (req.method === 'PATCH') {
    const { body } = req;

    if (!body) {
      throw new Error('No data posted');
    }

    if (!body._id) {
      throw new Error('No object ID is found');
    }

    if (!body.userID) {
      throw new Error('No user ID provided');
    }

    const { _id, userID } = body;

    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(_id), userID },
        { $set: { trashed: true } }
      );
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  if (req.method === 'GET') {
    const {
      query: { userID },
    } = req;
    if (!userID) {
      throw new Error('No user ID provided');
    }

    try {
      const result = await collection
        .find({
          userID,
          styles: {
            $ne: undefined,
          },
          trashed: {
            $ne: true,
          },
        })
        .toArray();
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
